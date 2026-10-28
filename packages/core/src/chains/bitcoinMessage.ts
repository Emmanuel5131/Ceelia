import { secp256k1 } from '@noble/curves/secp256k1.js';
import { ripemd160 } from '@noble/hashes/legacy.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, concatBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import { bech32, base64, createBase58check } from '@scure/base';
import type { ChainId } from './chains';

const base58check = createBase58check(sha256);

/** What differs between the chains that sign messages the way Bitcoin does: the text signed with, and how addresses are made. */
export type BitcoinParams = {
  /** The text put in front of the message before it is hashed, which stops a signed message from being a transaction. */
  magic: string;
  /** The first byte of a legacy address (starts with 1 on Bitcoin). */
  p2pkh: number;
  /** The first bytes a script address (starts with 3 on Bitcoin) can have. */
  p2sh: readonly number[];
  /** The start of a bech32 address (bc1 on Bitcoin), or null when the chain has none. */
  hrp: string | null;
};

const bitcoinParams: Partial<Record<ChainId, BitcoinParams>> = {
  bitcoin: { magic: 'Bitcoin Signed Message:\n', p2pkh: 0x00, p2sh: [0x05], hrp: 'bc' },
  litecoin: { magic: 'Litecoin Signed Message:\n', p2pkh: 0x30, p2sh: [0x32, 0x05], hrp: 'ltc' },
  dogecoin: { magic: 'Dogecoin Signed Message:\n', p2pkh: 0x1e, p2sh: [0x16], hrp: null },
};

/**
 * The signing rules of a chain that signs messages the way Bitcoin does.
 * @param chain - The chain.
 * @returns The rules, or undefined for any other chain.
 */
export function getBitcoinParams(chain: ChainId) {
  return bitcoinParams[chain];
}

// Bitcoin writes a length as one byte, or 0xfd and two bytes (little-endian) from 253 on.
const varInt = (length: number) =>
  length < 253 ? Uint8Array.of(length) : Uint8Array.of(0xfd, length & 0xff, length >> 8);

const withLength = (bytes: Uint8Array) => concatBytes(varInt(bytes.length), bytes);

const hash160 = (bytes: Uint8Array) => ripemd160(sha256(bytes));

/** What the address commits to: the key's hash for a legacy or bech32 address, or the hash of the script for a script address. */
type Target = { kind: 'p2pkh' | 'p2sh' | 'p2wpkh'; hash: Uint8Array };

// Reads an address into the kind it is and the 20 bytes it holds. A kind we cannot check, such as Taproot, gives null.
function readAddress(address: string, params: BitcoinParams): Target | null {
  try {
    const raw = base58check.decode(address);

    if (raw.length !== 21) {
      return null;
    }

    const version = raw[0] ?? -1;
    const hash = raw.slice(1);

    if (version === params.p2pkh) {
      return { kind: 'p2pkh', hash };
    }

    return params.p2sh.includes(version) ? { kind: 'p2sh', hash } : null;
  } catch {
    // Not a legacy address; it may be a bech32 one.
  }

  try {
    const decoded = bech32.decode(address.toLowerCase() as `${string}1${string}`);
    const [version, ...rest] = decoded.words;

    // Only version 0 with a 20-byte key hash. A Taproot address is bech32m and signs another way, so it fails above.
    if (decoded.prefix !== params.hrp || version !== 0) {
      return null;
    }

    const hash = Uint8Array.from(bech32.fromWords(rest));

    return hash.length === 20 ? { kind: 'p2wpkh', hash } : null;
  } catch {
    return null;
  }
}

// The hash the address should hold for a key, given the kind of address it is.
function addressHash(kind: Target['kind'], publicKey: Uint8Array) {
  return kind === 'p2sh' ? hash160(concatBytes(Uint8Array.of(0x00, 0x14), hash160(publicKey))) : hash160(publicKey);
}

/**
 * Checks that a signed message was signed by the wallet at a Bitcoin-style address (BIP-137). The signature is the 65 bytes
 * wallets show in base64: a header byte, then r and s. The header says which key form the wallet used and lets the signing key be
 * recovered; the check passes only when that key is the one the address holds. Like Electrum, it accepts a compressed key for any
 * kind of address, because many wallets sign for a segwit address that way. It does not check Taproot addresses, which sign with
 * BIP-322, and it gives false for anything it cannot confirm.
 * @param input - What to check.
 * @param input.params - The chain's signing rules.
 * @param input.address - The address that should have signed.
 * @param input.message - The exact text that was signed.
 * @param input.signature - The signature in base64.
 * @returns True only when the signature proves control of the address.
 */
export function verifyBitcoinMessage(input: {
  params: BitcoinParams;
  address: string;
  message: string;
  signature: string;
}) {
  const target = readAddress(input.address.trim(), input.params);

  try {
    const bytes = base64.decode(input.signature.trim());
    const header = bytes[0] ?? 0;

    if (!target || bytes.length !== 65 || header < 27 || header > 42) {
      return false;
    }

    const compressed = header >= 31;

    // A key that was not compressed can only belong to a legacy address.
    if (!compressed && target.kind !== 'p2pkh') {
      return false;
    }

    const digest = sha256(
      sha256(concatBytes(withLength(utf8ToBytes(input.params.magic)), withLength(utf8ToBytes(input.message)))),
    );
    const key = secp256k1.Signature.fromBytes(bytes.slice(1), 'compact')
      .addRecoveryBit((header - 27) & 3)
      .recoverPublicKey(digest)
      .toBytes(compressed);

    return bytesToHex(addressHash(target.kind, key)) === bytesToHex(target.hash);
  } catch {
    return false;
  }
}

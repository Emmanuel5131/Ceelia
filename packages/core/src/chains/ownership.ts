import { ed25519 } from '@noble/curves/ed25519.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, concatBytes, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import { base58, base64, createBase58check } from '@scure/base';
import type { ChainId } from './chains';
import { chainFamily } from './chains';
import type { ChainFamily } from './families';

const base58check = createBase58check(sha256);

/** The chain families whose ownership proof we can check. Others are filed with ownership "not confirmed". */
const verifiable: ChainFamily[] = ['evm', 'solana', 'tron'];

/**
 * Tells whether a signed message from a wallet on this chain can be checked.
 * @param chain - The chain.
 * @returns True for EVM chains, Solana and Tron.
 */
export function canVerifyOwnership(chain: ChainId) {
  return verifiable.includes(chainFamily(chain));
}

/**
 * The text a person signs to show they control a wallet. It names the wallet and the chain and carries a one-time nonce, so a
 * signature cannot be reused for another claim. It says nothing about money and authorises nothing.
 * @param input - The claim's wallet, chain and nonce.
 * @param input.chain - The chain.
 * @param input.address - The wallet address.
 * @param input.nonce - A one-time value created for this claim.
 * @returns The message to sign.
 */
export function ownershipMessage(input: { chain: ChainId; address: string; nonce: string }) {
  return [
    'Celia ownership proof',
    'I control this wallet and I am adding it to my claim on Celia. Signing this does not move funds or give anyone access to them.',
    `Chain: ${input.chain}`,
    `Wallet: ${input.address}`,
    `Nonce: ${input.nonce}`,
  ].join('\n');
}

const toHash = (prefix: string, message: string) => {
  const body = utf8ToBytes(message);

  return keccak_256(concatBytes(utf8ToBytes(`${prefix}${body.length}`), body));
};

/** Recovers the uncompressed public key from a 65-byte `r || s || v` signature over a message hash. */
function recoverPublicKey(signatureHex: string, hash: Uint8Array) {
  const bytes = hexToBytes(signatureHex.replace(/^0x/iu, ''));

  if (bytes.length !== 65) {
    return null;
  }

  const v = bytes[64] ?? 0;
  const recovery = v >= 27 ? v - 27 : v;

  if (recovery > 1) {
    return null;
  }

  return secp256k1.Signature.fromBytes(bytes.slice(0, 64), 'compact')
    .addRecoveryBit(recovery)
    .recoverPublicKey(hash)
    .toBytes(false);
}

const evmAddress = (publicKey: Uint8Array) => `0x${bytesToHex(keccak_256(publicKey.slice(1)).slice(12))}`;

const tronAddress = (publicKey: Uint8Array) =>
  base58check.encode(concatBytes(Uint8Array.of(0x41), keccak_256(publicKey.slice(1)).slice(12)));

/** Reads a Solana signature, which wallets show as base58 or base64. */
function readSolanaSignature(signature: string) {
  for (const decode of [() => base58.decode(signature), () => base64.decode(signature)]) {
    try {
      const bytes = decode();

      if (bytes.length === 64) {
        return bytes;
      }
    } catch {
      // Not in this encoding; try the next one.
    }
  }

  return null;
}

/**
 * Checks that a signature over `message` was made by the wallet at `address`. It returns false for anything it cannot
 * confirm: a malformed signature, the wrong wallet, or a chain family we cannot check yet.
 * - EVM: EIP-191 `personal_sign` (externally owned accounts; contract wallets are not covered).
 * - Tron: TIP-191 message signing.
 * - Solana: an ed25519 signature over the message bytes.
 * @param input - What to check.
 * @param input.chain - The chain.
 * @param input.address - The wallet address that should have signed.
 * @param input.message - The exact text that was signed.
 * @param input.signature - The signature as the wallet shows it (hex for EVM and Tron, base58 or base64 for Solana).
 * @returns True only when the signature proves control of the wallet.
 */
export function verifyOwnership(input: {
  chain: ChainId;
  address: string;
  message: string;
  signature: string;
}) {
  const signature = input.signature.trim();
  const address = input.address.trim();
  const family = chainFamily(input.chain);

  try {
    if (family === 'evm') {
      const key = recoverPublicKey(signature, toHash('\x19Ethereum Signed Message:\n', input.message));

      return key !== null && evmAddress(key).toLowerCase() === address.toLowerCase();
    }

    if (family === 'tron') {
      const key = recoverPublicKey(signature, toHash('\x19TRON Signed Message:\n', input.message));

      return key !== null && tronAddress(key) === address;
    }

    if (family === 'solana') {
      const bytes = readSolanaSignature(signature);

      return bytes !== null && ed25519.verify(bytes, utf8ToBytes(input.message), base58.decode(address));
    }
  } catch {
    return false;
  }

  return false;
}

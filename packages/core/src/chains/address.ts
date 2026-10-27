import { bech32, bech32m, createBase58check, base58 } from '@scure/base';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import type { ChainId } from './chains';
import { chainFamily } from './chains';

const base58check = createBase58check(sha256);

/** Whether a mixed-case EVM address carries a correct EIP-55 checksum. All-lowercase and all-uppercase are accepted as they are. */
function hasValidEvmChecksum(address: string) {
  const body = address.slice(2);

  if (body === body.toLowerCase() || body === body.toUpperCase()) {
    return true;
  }

  const hash = bytesToHex(keccak_256(utf8ToBytes(body.toLowerCase())));

  return [...body].every((char, i) => {
    const nibble = Number.parseInt(hash[i] ?? '0', 16);

    return /\d/u.test(char) || (nibble > 7 ? char === char.toUpperCase() : char === char.toLowerCase());
  });
}

const decodes = <T>(decode: () => T) => {
  try {
    return decode();
  } catch {
    return null;
  }
};

function isBitcoinAddress(address: string) {
  const legacy = decodes(() => base58check.decode(address));

  if (legacy) {
    return legacy.length === 21 && (legacy[0] === 0x00 || legacy[0] === 0x05);
  }

  const lower = address.toLowerCase();
  const v0 = decodes(() => bech32.decode(lower as `${string}1${string}`));

  if (v0) {
    return v0.prefix === 'bc' && v0.words[0] === 0 && [20, 32].includes((v0.words.length - 1) * 5 / 8 | 0);
  }

  const v1 = decodes(() => bech32m.decode(lower as `${string}1${string}`));

  return Boolean(v1 && v1.prefix === 'bc' && (v1.words[0] ?? 0) >= 1);
}

/**
 * Checks that an address has the right shape for its chain family, so a typo is caught before a claim is filed. It cannot
 * tell whether the address is in use.
 * @param chain - The chain.
 * @param address - The address as the person typed it.
 * @returns True when the format is valid for the chain's family. For the `other` family, any single word of reasonable length.
 */
export function isValidAddress(chain: ChainId, address: string) {
  const value = address.trim();

  switch (chainFamily(chain)) {
    case 'evm':
      return /^0x[0-9a-fA-F]{40}$/u.test(value) && hasValidEvmChecksum(value);
    case 'solana':
      return decodes(() => base58.decode(value))?.length === 32;
    case 'tron': {
      const bytes = decodes(() => base58check.decode(value));

      return bytes?.length === 21 && bytes[0] === 0x41;
    }
    case 'bitcoin':
      return isBitcoinAddress(value);
    default:
      return /^\S{10,200}$/u.test(value);
  }
}

/**
 * Checks that a transaction hash has the right shape for its chain, so a mistyped hash is caught before a claim is filed.
 * @param chain - The chain.
 * @param hash - The transaction hash as the person pasted it.
 * @returns True when the format is valid for the chain's family.
 */
export function isValidTxHash(chain: ChainId, hash: string) {
  const value = hash.trim();

  switch (chainFamily(chain)) {
    case 'evm':
      return /^0x[0-9a-fA-F]{64}$/u.test(value);
    case 'tron':
    case 'bitcoin':
      return /^[0-9a-fA-F]{64}$/u.test(value);
    case 'solana':
      return decodes(() => base58.decode(value))?.length === 64;
    default:
      return /^\S{10,200}$/u.test(value);
  }
}

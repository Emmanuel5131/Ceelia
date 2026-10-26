import { ed25519 } from '@noble/curves/ed25519.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, concatBytes, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import { base58, createBase58check } from '@scure/base';
import { describe, expect, it } from 'vitest';
import { canVerifyOwnership, ownershipMessage, verifyOwnership } from './ownership';

// A well-known development key (Hardhat account 0) and its address.
const privateKey = hexToBytes('ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
const evmAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
// A Tron address is 0x41 plus the same 20 bytes, in base58check (the Tron address format).
const tronAddress = createBase58check(sha256).encode(
  concatBytes(Uint8Array.of(0x41), hexToBytes(evmAddress.slice(2))),
);

const message = ownershipMessage({ chain: 'evm', address: evmAddress, nonce: 'nonce-1' });

/** Signs like a wallet: hashes with the given prefix, then returns `r || s || v` in hex. */
function walletSign(prefix: string, text: string, key = privateKey) {
  const body = utf8ToBytes(text);
  const hash = keccak_256(concatBytes(utf8ToBytes(`${prefix}${body.length}`), body));
  const compact = secp256k1.sign(hash, key, { prehash: false });
  const publicKey = secp256k1.getPublicKey(key, false);
  const recovery = [0, 1].find(
    (r) =>
      bytesToHex(
        secp256k1.Signature.fromBytes(compact, 'compact').addRecoveryBit(r).recoverPublicKey(hash).toBytes(false),
      ) === bytesToHex(publicKey),
  );

  return `0x${bytesToHex(concatBytes(compact, Uint8Array.of(27 + (recovery ?? 0))))}`;
}

describe('ownershipMessage', () => {
  it('names the wallet, the chain and the nonce', () => {
    expect(message).toContain(evmAddress);
    expect(message).toContain('Chain: evm');
    expect(message).toContain('Nonce: nonce-1');
  });
});

describe('canVerifyOwnership', () => {
  it('is true for EVM, Solana and Tron only', () => {
    expect(['evm', 'solana', 'tron', 'bitcoin', 'other'].map((c) => canVerifyOwnership(c as 'evm'))).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
  });
});

describe('verifyOwnership', () => {
  describe('evm', () => {
    it('accepts a signature from the wallet', () => {
      const signature = walletSign('\x19Ethereum Signed Message:\n', message);

      expect(verifyOwnership({ chain: 'evm', address: evmAddress, message, signature })).toBe(true);
    });

    it('accepts the address in any case', () => {
      const signature = walletSign('\x19Ethereum Signed Message:\n', message);

      expect(
        verifyOwnership({ chain: 'evm', address: evmAddress.toLowerCase(), message, signature }),
      ).toBe(true);
    });

    it('rejects a signature over a different message', () => {
      const signature = walletSign('\x19Ethereum Signed Message:\n', 'something else');

      expect(verifyOwnership({ chain: 'evm', address: evmAddress, message, signature })).toBe(false);
    });

    it('rejects a signature from another wallet', () => {
      const other = secp256k1.utils.randomSecretKey();
      const signature = walletSign('\x19Ethereum Signed Message:\n', message, other);

      expect(verifyOwnership({ chain: 'evm', address: evmAddress, message, signature })).toBe(false);
    });

    it('rejects garbage', () => {
      expect(verifyOwnership({ chain: 'evm', address: evmAddress, message, signature: 'nope' })).toBe(false);
    });
  });

  describe('tron', () => {
    it('accepts a TIP-191 signature from the wallet', () => {
      const signature = walletSign('\x19TRON Signed Message:\n', message);

      expect(verifyOwnership({ chain: 'tron', address: tronAddress, message, signature })).toBe(true);
    });

    it('rejects an Ethereum-prefixed signature', () => {
      const signature = walletSign('\x19Ethereum Signed Message:\n', message);

      expect(verifyOwnership({ chain: 'tron', address: tronAddress, message, signature })).toBe(false);
    });
  });

  describe('solana', () => {
    const secret = Uint8Array.from({ length: 32 }, (_, i) => i + 1);
    const address = base58.encode(ed25519.getPublicKey(secret));
    const signature = base58.encode(ed25519.sign(utf8ToBytes(message), secret));

    it('accepts an ed25519 signature from the wallet', () => {
      expect(verifyOwnership({ chain: 'solana', address, message, signature })).toBe(true);
    });

    it('rejects a signature over a different message', () => {
      expect(verifyOwnership({ chain: 'solana', address, message: 'other', signature })).toBe(false);
    });
  });

  it('cannot confirm a chain it does not support', () => {
    expect(
      verifyOwnership({ chain: 'bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', message, signature: 'x' }),
    ).toBe(false);
  });
});

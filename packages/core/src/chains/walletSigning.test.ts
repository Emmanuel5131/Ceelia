import { ed25519 } from '@noble/curves/ed25519.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex, concatBytes, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import { base58 } from '@scure/base';
import { describe, expect, it } from 'vitest';
import { ownershipMessage, verifyOwnership } from './ownership';
import { evmSigner, signOwnership, solanaSigner, tronSigner } from './walletSigning';

const evmKey = hexToBytes('ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
const evmAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

/** Signs like MetaMask: the text arrives as hex, and the signature is `r || s || v` in hex. */
function personalSign(hexText: string) {
  const body = hexToBytes(hexText.slice(2));
  const hash = keccak_256(
    concatBytes(utf8ToBytes(`\x19Ethereum Signed Message:\n${body.length}`), body),
  );
  const compact = secp256k1.sign(hash, evmKey, { prehash: false });
  const publicKey = bytesToHex(secp256k1.getPublicKey(evmKey, false));
  const recovery = [0, 1].find(
    (r) =>
      bytesToHex(
        secp256k1.Signature.fromBytes(compact, 'compact')
          .addRecoveryBit(r)
          .recoverPublicKey(hash)
          .toBytes(false),
      ) === publicKey,
  );

  return `0x${bytesToHex(concatBytes(compact, Uint8Array.of(27 + (recovery ?? 0))))}`;
}

const evmWallet = (accounts: string[]) =>
  evmSigner({
    request: async (call) => {
      await Promise.resolve();

      if (call.method === 'eth_requestAccounts') {
        return accounts;
      }

      const [text] = call.params ?? [];

      return personalSign(String(text));
    },
  });

describe('signOwnership', () => {
  describe('evm', () => {
    const message = ownershipMessage({ chain: 'ethereum', address: evmAddress, nonce: 'n-1' });

    it('gives a signature the check accepts', async () => {
      const outcome = await signOwnership(evmWallet([evmAddress.toLowerCase()]), {
        chain: 'ethereum',
        address: evmAddress,
        message,
      });

      expect(outcome.ok && verifyOwnership({ chain: 'ethereum', address: evmAddress, message, signature: outcome.signature })).toBe(true);
    });

    it('reports a connected wallet that is not the one on the claim', async () => {
      const outcome = await signOwnership(evmWallet(['0x0000000000000000000000000000000000000001']), {
        chain: 'ethereum',
        address: evmAddress,
        message,
      });

      expect(outcome).toEqual({ ok: false, reason: 'wrong_wallet' });
    });

    it('reports a person who says no', async () => {
      const wallet = evmSigner({
        request: async () => {
          await Promise.resolve();
          throw Object.assign(new Error('User rejected the request.'), { code: 4001 });
        },
      });

      expect(await signOwnership(wallet, { chain: 'ethereum', address: evmAddress, message })).toEqual({
        ok: false,
        reason: 'rejected',
      });
    });

    it('reports any other failure', async () => {
      const wallet = evmSigner({
        request: async () => {
          await Promise.resolve();
          throw new Error('boom');
        },
      });

      expect(await signOwnership(wallet, { chain: 'ethereum', address: evmAddress, message })).toEqual({
        ok: false,
        reason: 'failed',
      });
    });
  });

  describe('solana', () => {
    const secret = ed25519.utils.randomSecretKey();
    const address = base58.encode(ed25519.getPublicKey(secret));
    const message = ownershipMessage({ chain: 'solana', address, nonce: 'n-2' });
    const phantom = solanaSigner({
      connect: async () => {
        await Promise.resolve();

        return { publicKey: { toBase58: () => address } };
      },
      signMessage: async (bytes) => {
        await Promise.resolve();

        return { signature: ed25519.sign(bytes, secret) };
      },
    });

    it('gives a signature the check accepts', async () => {
      const outcome = await signOwnership(phantom, { chain: 'solana', address, message });

      expect(outcome.ok && verifyOwnership({ chain: 'solana', address, message, signature: outcome.signature })).toBe(true);
    });

    it('compares the address letter for letter', async () => {
      const outcome = await signOwnership(phantom, {
        chain: 'solana',
        address: address.toLowerCase(),
        message,
      });

      expect(outcome).toEqual({ ok: false, reason: 'wrong_wallet' });
    });
  });

  describe('tron', () => {
    it('signs with the Tron object that appears after connecting', async () => {
      let connected = false;
      const wallet = tronSigner({
        request: async () => {
          await Promise.resolve();
          connected = true;
        },
        tronWeb: () =>
          connected
            ? {
                defaultAddress: { base58: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' },
                trx: { signMessageV2: async () => 'abc' },
              }
            : false,
      });

      expect(
        await signOwnership(wallet, {
          chain: 'tron',
          address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          message: 'hello',
        }),
      ).toEqual({ ok: true, signature: 'abc' });
    });
  });
});

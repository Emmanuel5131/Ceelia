import { secp256k1 } from '@noble/curves/secp256k1.js';
import { ripemd160 } from '@noble/hashes/legacy.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { concatBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import { base64, bech32, createBase58check } from '@scure/base';
import { describe, expect, it } from 'vitest';
import { getBitcoinParams, verifyBitcoinMessage } from './bitcoinMessage';
import { canVerifyOwnership, ownershipMessage, verifyOwnership } from './ownership';

const base58check = createBase58check(sha256);
const bitcoin = getBitcoinParams('bitcoin');
const hash160 = (bytes: Uint8Array) => ripemd160(sha256(bytes));

// Bitcoin Core's own test (test/functional/rpc_signmessagewithprivkey.py): a fixed regtest key, message and signature.
const core = {
  params: { magic: 'Bitcoin Signed Message:\n', p2pkh: 0x6f, p2sh: [0xc4], hrp: 'bcrt' },
  address: 'mpLQjfK79b7CCV4VMJWEWAj5Mpx8Up5zxB',
  message: 'This is just a test message',
  signature:
    'INbVnW4e6PeRmsv2Qgu8NuopvrVjkcxob+sX8OcZG0SALhWybUjzMLPdAsXI46YZGb0KQTRii+wWIQzRpG/U+S0=',
};

const varInt = (n: number) => (n < 253 ? Uint8Array.of(n) : Uint8Array.of(0xfd, n & 0xff, n >> 8));
const key = Uint8Array.from({ length: 32 }, (_, i) => i + 1);
const publicKey = secp256k1.getPublicKey(key, true);
const uncompressed = secp256k1.getPublicKey(key, false);

/** Signs like a wallet does: the hash of the magic and message, with a header byte that says which key form was used. */
function sign(magic: string, message: string, header: 'compressed' | 'uncompressed' | number) {
  const m = utf8ToBytes(magic);
  const body = utf8ToBytes(message);
  const digest = sha256(sha256(concatBytes(varInt(m.length), m, varInt(body.length), body)));
  const compact = secp256k1.sign(digest, key, { prehash: false });
  const wanted = publicKey.toString();
  const recovery = [0, 1].find(
    (r) =>
      secp256k1.Signature.fromBytes(compact, 'compact')
        .addRecoveryBit(r)
        .recoverPublicKey(digest)
        .toBytes(true)
        .toString() === wanted,
  );
  const base = header === 'uncompressed' ? 27 : header === 'compressed' ? 31 : header;

  return base64.encode(concatBytes(Uint8Array.of(base + (recovery ?? 0)), compact));
}

const legacy = (version: number, k: Uint8Array) => base58check.encode(concatBytes(Uint8Array.of(version), hash160(k)));
const scriptAddress = base58check.encode(
  concatBytes(Uint8Array.of(0x05), hash160(concatBytes(Uint8Array.of(0, 0x14), hash160(publicKey)))),
);
const segwit = bech32.encode('bc', [0, ...bech32.toWords(hash160(publicKey))]);
const message = ownershipMessage({ chain: 'bitcoin', address: legacy(0, publicKey), nonce: 'n-1' });

describe(verifyBitcoinMessage, () => {
  it('accepts the signature in Bitcoin Core’s own test', () => {
    expect(verifyBitcoinMessage(core)).toBe(true);
  });

  it('refuses that signature for another message or another address', () => {
    expect(verifyBitcoinMessage({ ...core, message: 'This is another message' })).toBe(false);
    expect(verifyBitcoinMessage({ ...core, address: 'mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8' })).toBe(false);
  });

  it('accepts a message signed for a legacy address, compressed or not', () => {
    const compressed = sign('Bitcoin Signed Message:\n', message, 'compressed');
    const plain = sign('Bitcoin Signed Message:\n', message, 'uncompressed');

    expect(bitcoin && verifyBitcoinMessage({ params: bitcoin, address: legacy(0, publicKey), message, signature: compressed })).toBe(true);
    expect(bitcoin && verifyBitcoinMessage({ params: bitcoin, address: legacy(0, uncompressed), message, signature: plain })).toBe(true);
  });

  it('accepts a segwit address signed with either header wallets use', () => {
    for (const header of ['compressed', 39, 35] as const) {
      const signature = sign('Bitcoin Signed Message:\n', message, header);

      expect(bitcoin && verifyBitcoinMessage({ params: bitcoin, address: segwit, message, signature })).toBe(true);
      expect(bitcoin && verifyBitcoinMessage({ params: bitcoin, address: scriptAddress, message, signature })).toBe(true);
    }
  });

  it('refuses an uncompressed key for a segwit address, a Taproot address and a wrong wallet', () => {
    const plain = sign('Bitcoin Signed Message:\n', message, 'uncompressed');
    const signature = sign('Bitcoin Signed Message:\n', message, 'compressed');
    const taproot = bech32.encode('bc', [1, ...bech32.toWords(publicKey.slice(1))]);

    expect(bitcoin && verifyBitcoinMessage({ params: bitcoin, address: segwit, message, signature: plain })).toBe(false);
    expect(bitcoin && verifyBitcoinMessage({ params: bitcoin, address: taproot, message, signature })).toBe(false);
    expect(bitcoin && verifyBitcoinMessage({ params: bitcoin, address: legacy(0, secp256k1.getPublicKey(key.map((b) => b + 1), true)), message, signature })).toBe(false);
  });

  it('refuses a malformed signature', () => {
    expect(bitcoin && verifyBitcoinMessage({ params: bitcoin, address: segwit, message, signature: 'nope' })).toBe(false);
    expect(bitcoin && verifyBitcoinMessage({ params: bitcoin, address: segwit, message, signature: base64.encode(new Uint8Array(65)) })).toBe(false);
  });
});

describe('Litecoin and Dogecoin', () => {
  it('check a message signed with their own text', () => {
    const litecoin = getBitcoinParams('litecoin');
    const dogecoin = getBitcoinParams('dogecoin');

    expect(litecoin && verifyBitcoinMessage({ params: litecoin, address: legacy(0x30, publicKey), message, signature: sign('Litecoin Signed Message:\n', message, 'compressed') })).toBe(true);
    expect(dogecoin && verifyBitcoinMessage({ params: dogecoin, address: legacy(0x1e, publicKey), message, signature: sign('Dogecoin Signed Message:\n', message, 'compressed') })).toBe(true);
    expect(dogecoin && verifyBitcoinMessage({ params: dogecoin, address: legacy(0x1e, publicKey), message, signature: sign('Bitcoin Signed Message:\n', message, 'compressed') })).toBe(false);
  });
});

describe('verifyOwnership for Bitcoin chains', () => {
  it('is on for Bitcoin, Litecoin and Dogecoin and still off for others', () => {
    expect(['bitcoin', 'litecoin', 'dogecoin', 'xrp', 'cosmos'].map((c) => canVerifyOwnership(c as 'bitcoin'))).toEqual([true, true, true, false, false]);
  });

  it('confirms a Bitcoin wallet from a signed message', () => {
    const address = legacy(0, publicKey);
    const text = ownershipMessage({ chain: 'bitcoin', address, nonce: 'n-2' });

    expect(verifyOwnership({ chain: 'bitcoin', address, message: text, signature: sign('Bitcoin Signed Message:\n', text, 'compressed') })).toBe(true);
  });
});

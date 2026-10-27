import { describe, expect, it } from 'vitest';
import { isValidAddress, isValidTxHash } from './address';

describe('isValidAddress', () => {
  describe('evm', () => {
    it('accepts a checksummed address', () => {
      expect(isValidAddress('evm', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')).toBe(true);
    });

    it('accepts an all-lowercase address', () => {
      expect(isValidAddress('evm', '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')).toBe(true);
    });

    it('rejects a mixed-case address with a wrong checksum', () => {
      expect(isValidAddress('evm', '0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266')).toBe(false);
    });

    it('rejects a short address', () => {
      expect(isValidAddress('evm', '0xf39fd6e51aad88f6')).toBe(false);
    });
  });

  describe('solana', () => {
    it('accepts a 32-byte base58 address', () => {
      expect(isValidAddress('solana', 'So11111111111111111111111111111111111111112')).toBe(true);
    });

    it('rejects an EVM address', () => {
      expect(isValidAddress('solana', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')).toBe(false);
    });
  });

  describe('tron', () => {
    it('accepts a T address', () => {
      expect(isValidAddress('tron', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')).toBe(true);
    });

    it('rejects an address with a wrong checksum', () => {
      expect(isValidAddress('tron', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6u')).toBe(false);
    });
  });

  describe('bitcoin', () => {
    it.each([
      '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr',
    ])('accepts %s', (address) => {
      expect(isValidAddress('bitcoin', address)).toBe(true);
    });

    it('rejects a legacy address with a wrong checksum', () => {
      expect(isValidAddress('bitcoin', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb')).toBe(false);
    });
  });

  describe('other', () => {
    it('accepts a single word of reasonable length', () => {
      expect(isValidAddress('other', 'cosmos1abcdefghijk')).toBe(true);
    });

    it('rejects text with spaces', () => {
      expect(isValidAddress('other', 'not an address')).toBe(false);
    });
  });
});

describe('isValidTxHash', () => {
  const hex64 = 'a'.repeat(64);

  it('accepts a 0x-prefixed 32-byte hash on an EVM chain', () => {
    expect(isValidTxHash('ethereum', `0x${hex64}`)).toBe(true);
    expect(isValidTxHash('ethereum', hex64)).toBe(false);
  });

  it('accepts a bare 32-byte hash on Tron and Bitcoin', () => {
    expect(isValidTxHash('tron', hex64)).toBe(true);
    expect(isValidTxHash('bitcoin', hex64)).toBe(true);
    expect(isValidTxHash('tron', `0x${hex64}`)).toBe(false);
  });

  it('accepts a base58 signature on Solana', () => {
    expect(isValidTxHash('solana', '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW')).toBe(true);
    expect(isValidTxHash('solana', 'short')).toBe(false);
  });

  it('accepts any single word on chains we cannot check', () => {
    expect(isValidTxHash('ton', 'abcdefghijklmnop')).toBe(true);
  });
});

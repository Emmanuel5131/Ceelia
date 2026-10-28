import { describe, expect, it } from 'vitest';
import { accountKindOfCode, accountKindOfOwner } from './AccountKind';

describe(accountKindOfCode, () => {
  it('reads an address with no code as a regular wallet', () => {
    expect(accountKindOfCode('0x')).toBe('eoa');
  });

  it('reads a delegated wallet as a regular wallet', () => {
    expect(accountKindOfCode(`0xef0100${'ab'.repeat(20)}`)).toBe('eoa');
  });

  it('reads an address with contract code as a contract wallet', () => {
    expect(accountKindOfCode('0x6080604052')).toBe('contract');
  });
});

describe(accountKindOfOwner, () => {
  it('reads an account owned by the system program as a regular wallet', () => {
    expect(accountKindOfOwner('11111111111111111111111111111111')).toBe('eoa');
  });

  it('reads an account owned by another program as a contract wallet', () => {
    expect(accountKindOfOwner('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')).toBe('contract');
  });
});

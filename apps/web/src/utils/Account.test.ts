import { describe, expect, it } from 'vitest';
import { parseAccount } from './Account';

describe(parseAccount, () => {
  it('returns null when no account type is set', () => {
    expect(parseAccount({})).toBeNull();
    expect(parseAccount(null)).toBeNull();
  });

  it('returns null for an unknown account type', () => {
    expect(parseAccount({ accountType: 'admin' })).toBeNull();
  });

  it('reads a person', () => {
    expect(parseAccount({ accountType: 'person' })).toStrictEqual({ accountType: 'person' });
  });

  it('reads counsel with its review status', () => {
    expect(parseAccount({ accountType: 'counsel', review: 'pending' })).toStrictEqual({
      accountType: 'counsel',
      review: 'pending',
    });
  });
});

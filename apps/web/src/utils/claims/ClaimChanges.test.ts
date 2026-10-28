import { describe, expect, it } from 'vitest';
import { claimChanges } from '@/utils/claims/ClaimChanges';

describe(claimChanges, () => {
  it('finds a changed field with both values', () => {
    expect(claimChanges({ amountLost: '$100' }, { amountLost: '$150' })).toStrictEqual({
      amountLost: { from: '$100', to: '$150' },
    });
  });

  it('finds nothing when the values match', () => {
    expect(claimChanges({ chain: 'evm' }, { chain: 'evm' })).toStrictEqual({});
  });

  it('treats an empty value and a missing one as the same', () => {
    expect(claimChanges({ platformUrl: null }, { platformUrl: '' })).toStrictEqual({});
  });

  it('compares lists by their contents', () => {
    expect(claimChanges({ fraudTypes: ['rug_pull'] }, { fraudTypes: ['rug_pull'] })).toStrictEqual(
      {},
    );
    expect(claimChanges({ fraudTypes: ['rug_pull'] }, { fraudTypes: ['phishing'] })).toHaveProperty(
      'fraudTypes',
    );
  });

  it('ignores the nonce', () => {
    expect(claimChanges({ nonce: 'a' }, { nonce: 'b' })).toStrictEqual({});
  });

  it('reports a value that was added', () => {
    expect(claimChanges({ txHash: null }, { txHash: '0xabc' })).toStrictEqual({
      txHash: { from: null, to: '0xabc' },
    });
  });
});

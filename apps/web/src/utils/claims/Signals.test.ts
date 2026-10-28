import { describe, expect, it } from 'vitest';
import { burst, inBurst, transactionSignals } from '@/utils/claims/Signals';
import type { StoredCheck } from '@/utils/claims/Transaction';

const found = (role: StoredCheck['role']): StoredCheck => ({
  checkedAt: '2026-10-01T00:00:00.000Z',
  status: 'found',
  facts: null,
  role,
});

describe(transactionSignals, () => {
  it('gives nothing when no check was made', () => {
    expect(transactionSignals(null)).toStrictEqual([]);
  });

  it('flags a transaction the chain does not show', () => {
    const check: StoredCheck = { ...found(null), status: 'not_found' };

    expect(transactionSignals(check)).toStrictEqual(['tx_missing']);
  });

  it('flags a transaction without the claim wallet in it', () => {
    expect(transactionSignals(found('none'))).toStrictEqual(['tx_not_theirs']);
  });

  it('gives nothing when the wallet sent it', () => {
    expect(transactionSignals(found('sender'))).toStrictEqual([]);
  });
});

describe(inBurst, () => {
  const at = 1_000_000_000_000;
  const close = Array.from({ length: burst.others }, (_, index) => at + index * 1000);

  it('flags enough claims inside the window', () => {
    expect(inBurst(at, close)).toBeTruthy();
  });

  it('ignores claims outside the window', () => {
    expect(
      inBurst(
        at,
        close.map((time) => time + burst.windowMs * 2),
      ),
    ).toBeFalsy();
  });

  it('needs enough claims', () => {
    expect(inBurst(at, close.slice(1))).toBeFalsy();
  });
});

import { describe, expect, it } from 'vitest';
import { notificationCatalog, notificationTypes, shouldEmail } from './notifications';

describe(shouldEmail, () => {
  it('sends an update by default', () => {
    expect(shouldEmail('claim_submitted', {})).toBeTruthy();
  });

  it('skips an update when the person turned its category off', () => {
    expect(shouldEmail('case_sealed', { cases: false })).toBeFalsy();
  });

  it('keeps sending a category the person left on', () => {
    expect(shouldEmail('case_sealed', { claims: false })).toBeTruthy();
  });

  it('sends an account notice whatever the person chose', () => {
    expect(shouldEmail('counsel_verified', { claims: false, cases: false })).toBeTruthy();
  });

  it('sends the confirmation of taking a case even when cases are off', () => {
    expect(shouldEmail('case_taken_by_you', { cases: false })).toBeTruthy();
  });
});

describe('notificationCatalog', () => {
  it('describes every type', () => {
    expect(Object.keys(notificationCatalog).toSorted()).toStrictEqual(
      [...notificationTypes].toSorted(),
    );
  });

  it('keeps account notices essential', () => {
    const account = Object.values(notificationCatalog).filter(
      (entry) => entry.category === 'account',
    );

    expect(account.every((entry) => entry.essential)).toBeTruthy();
  });
});

import { describe, expect, it } from 'vitest';
import { emailLocale, planNotifications } from './NotifyPlan';
import type { NotifyEvent } from './NotifyPlan';

const event = (type: NotifyEvent['type'], userId = 'u1'): NotifyEvent => ({
  userId,
  type,
  dedupeKey: `${type}:1`,
});

describe(planNotifications, () => {
  it('plans an email for a person with no choices', () => {
    expect(
      planNotifications([event('claim_submitted')], {
        preferences: new Map(),
        locales: new Map(),
      }),
    ).toMatchObject([{ email: true, locale: 'en' }]);
  });

  it('skips the email when the person turned the category off', () => {
    expect(
      planNotifications([event('case_sealed')], {
        preferences: new Map([['u1', { cases: false }]]),
        locales: new Map(),
      }),
    ).toMatchObject([{ email: false }]);
  });

  it('uses each person’s own choices', () => {
    const plans = planNotifications([event('case_sealed', 'u1'), event('case_sealed', 'u2')], {
      preferences: new Map([['u1', { cases: false }]]),
      locales: new Map(),
    });

    expect(plans.map((plan) => plan.email)).toStrictEqual([false, true]);
  });

  it('writes in the saved language', () => {
    expect(
      planNotifications([event('claim_submitted')], {
        preferences: new Map(),
        locales: new Map([['u1', 'fr']]),
      }),
    ).toMatchObject([{ locale: 'fr' }]);
  });
});

describe(emailLocale, () => {
  it('falls back to the default for a language we have no copy for', () => {
    expect(emailLocale('de')).toBe('en');
  });

  it('falls back to the default when none was saved', () => {
    expect(emailLocale()).toBe('en');
  });
});

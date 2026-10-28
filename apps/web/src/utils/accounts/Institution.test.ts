import { describe, expect, it } from 'vitest';
import {
  addWorkingDays,
  approvalRefusal,
  canReapply,
  emailDomainCheck,
  reapplyAfterDays,
  reviewChecks,
} from '@/utils/accounts/Institution';

const allChecked = Object.fromEntries(reviewChecks.map((check) => [check, true]));

describe(addWorkingDays, () => {
  it('skips the weekend', () => {
    // Thursday 2026-10-29 plus three working days is Tuesday 2026-11-03.
    expect(addWorkingDays(new Date('2026-10-29T10:00:00Z'), 3).toISOString().slice(0, 10)).toBe(
      '2026-11-03',
    );
  });

  it('adds nothing for zero days', () => {
    expect(addWorkingDays(new Date('2026-10-29T10:00:00Z'), 0).toISOString().slice(0, 10)).toBe(
      '2026-10-29',
    );
  });
});

describe(emailDomainCheck, () => {
  it('accepts an address on the website domain', () => {
    expect(emailDomainCheck('ana@firm.example', 'https://www.firm.example')).toBe('own');
  });

  it('accepts a subdomain of the website', () => {
    expect(emailDomainCheck('ana@mail.firm.example', 'firm.example')).toBe('own');
  });

  it('flags a free mail service', () => {
    expect(emailDomainCheck('ana@gmail.com', 'https://firm.example')).toBe('free');
  });

  it('flags a different domain', () => {
    expect(emailDomainCheck('ana@other.example', 'https://firm.example')).toBe('different');
  });

  it('cannot tell without a website', () => {
    expect(emailDomainCheck('ana@firm.example', null)).toBe('unknown');
  });
});

describe(approvalRefusal, () => {
  const base = {
    checks: allChecked,
    readyBy: 'staff_a',
    actor: 'staff_b',
    production: true,
  };

  it('lets a second person approve once every check is ticked', () => {
    expect(approvalRefusal(base)).toBe('ok');
  });

  it('needs every check', () => {
    expect(approvalRefusal({ ...base, checks: { ...allChecked, callback: false } })).toBe(
      'checks_incomplete',
    );
  });

  it('needs the application to be marked ready first', () => {
    expect(approvalRefusal({ ...base, readyBy: null })).toBe('not_ready');
  });

  it('stops the same person approving in production', () => {
    expect(approvalRefusal({ ...base, actor: 'staff_a' })).toBe('same_person');
  });

  it('lets one person do both in development', () => {
    expect(approvalRefusal({ ...base, actor: 'staff_a', production: false })).toBe('ok');
  });
});

describe(canReapply, () => {
  const decided = new Date('2026-10-01T00:00:00Z');
  const day = 24 * 60 * 60 * 1000;

  it('waits out the period', () => {
    expect(
      canReapply(decided, new Date(decided.getTime() + (reapplyAfterDays - 1) * day)),
    ).toBeFalsy();
  });

  it('allows it after the period', () => {
    expect(canReapply(decided, new Date(decided.getTime() + reapplyAfterDays * day))).toBeTruthy();
  });
});

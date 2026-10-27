import { describe, expect, it } from 'vitest';
import { notificationPath } from './NotificationLink';

describe(notificationPath, () => {
  it('opens the claim for a claim notification', () => {
    expect(notificationPath('claim_submitted', { claimId: 'abc' })).toBe('/dashboard/claims/abc');
  });

  it('opens the case for a case notification', () => {
    expect(notificationPath('case_taken', { caseId: 'xyz' })).toBe('/dashboard/cases/xyz');
  });

  it('opens the case bank when the case id is missing', () => {
    expect(notificationPath('case_sealed', {})).toBe('/dashboard/cases');
  });

  it('opens settings for a registration notice', () => {
    expect(notificationPath('counsel_verified', {})).toBe('/dashboard/settings');
  });
});

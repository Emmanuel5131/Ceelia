import { describe, expect, it } from 'vitest';
import { claimState } from '@/utils/claims/ClaimState';

const date = new Date('2026-10-01T00:00:00Z');
const base = {
  status: 'submitted',
  validatedAt: null,
  rejectedAt: null,
  staffReviewStartedAt: null,
};

describe(claimState, () => {
  it('calls a claim that was never sent a draft', () => {
    expect(claimState({ ...base, status: 'draft' })).toBe('draft');
  });

  it('calls a sent claim nobody has started on sent', () => {
    expect(claimState(base)).toBe('sent');
  });

  it('calls a sent claim staff have started on in review', () => {
    expect(claimState({ ...base, staffReviewStartedAt: date })).toBe('in_review');
  });

  it('calls a validated claim accepted, whatever came before', () => {
    expect(claimState({ ...base, staffReviewStartedAt: date, validatedAt: date })).toBe('accepted');
  });

  it('calls a rejected claim rejected', () => {
    expect(claimState({ ...base, staffReviewStartedAt: date, rejectedAt: date })).toBe('rejected');
  });
});

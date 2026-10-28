/** Where a claim stands, as the person sees it. */
export type ClaimState = 'draft' | 'sent' | 'in_review' | 'accepted' | 'rejected';

/** The order claims are sorted in: along the way a claim takes, from a draft to the staff's decision. */
export const claimStateOrder: Record<ClaimState, number> = {
  draft: 0,
  sent: 1,
  in_review: 2,
  accepted: 3,
  rejected: 4,
};

/**
 * Works out a claim's state from what is known about it. A rejection or an acceptance settles it; before that a sent claim is
 * "in review" once staff have started on it, and "sent" until then. A claim that was never sent is a draft.
 * @param claim - The claim's fields that decide its state.
 * @param claim.status - `draft` until the person sends it, then `submitted`.
 * @param claim.validatedAt - When staff accepted it, or null.
 * @param claim.rejectedAt - When staff rejected it, or null.
 * @param claim.staffReviewStartedAt - When staff started reviewing it, or null.
 * @returns The state.
 */
export function claimState(claim: {
  status: string;
  validatedAt: Date | null;
  rejectedAt: Date | null;
  staffReviewStartedAt: Date | null;
}): ClaimState {
  if (claim.rejectedAt) {
    return 'rejected';
  }

  if (claim.validatedAt) {
    return 'accepted';
  }

  if (claim.status !== 'submitted') {
    return 'draft';
  }

  return claim.staffReviewStartedAt ? 'in_review' : 'sent';
}

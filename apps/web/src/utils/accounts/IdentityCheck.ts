/** The most times a person can try the identity check before they have to write to us. */
export const identityMaxAttempts = 5;

/**
 * What an Idswyft result means for Celia. Only `verified` passes: a manual review or a rejection leaves the person unverified.
 * @param finalResult - The `final_result` Idswyft gave at the end of the check.
 * @returns `verified` or `failed`.
 */
export function identityOutcome(finalResult: string | null | undefined): 'verified' | 'failed' {
  return finalResult === 'verified' ? 'verified' : 'failed';
}

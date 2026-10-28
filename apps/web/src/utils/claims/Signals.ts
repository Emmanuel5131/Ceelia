import type { StoredCheck } from '@/utils/claims/Transaction';

/**
 * Things about a sent claim that staff should look at before confirming it. None of them proves a claim is false; each one is a
 * reason to look closer.
 */
export type ClaimSignal =
  | 'wallet_signed_elsewhere'
  | 'wallet_shared'
  | 'tx_shared'
  | 'tx_missing'
  | 'tx_not_theirs'
  | 'burst';

/** The most claims one person can send in a day. A real victim has a few; a script has hundreds. */
export const maxClaimsPerDay = 10;

/** How close together claims against one platform must be, and how many, to look like one batch. */
export const burst = { windowMs: 10 * 60 * 1000, others: 5 };

/**
 * Reads the signals out of what the chain showed for the claim's payment transaction.
 * @param check - The stored check, or null when none was made.
 * @returns `tx_missing` when the chain showed nothing for the ID, `tx_not_theirs` when the claim's wallet is not in it.
 */
export function transactionSignals(check: StoredCheck | null): ClaimSignal[] {
  if (!check) {
    return [];
  }

  if (check.status === 'not_found') {
    return ['tx_missing'];
  }

  return check.role === 'none' ? ['tx_not_theirs'] : [];
}

/**
 * Whether a claim arrived together with a batch of others against the same platform.
 * @param at - When the claim was sent, in milliseconds.
 * @param others - When the other people's claims against the platform were sent, in milliseconds.
 * @returns True when enough other people sent within the window around it.
 */
export function inBurst(at: number, others: number[]) {
  return others.filter((time) => Math.abs(time - at) <= burst.windowMs).length >= burst.others;
}

import type { claimSchema } from '@/models/Schema';

type ClaimProgress = Pick<
  typeof claimSchema.$inferSelect,
  'ownership' | 'paymentMethod' | 'statement' | 'status'
>;

export type StepState = 'done' | 'current' | 'todo';

/**
 * Works out where a claim stands. The steps are in order: wallet added, ownership proven (for a claim paid from an exchange, a crypto ATM or a person there is no wallet to sign with, so the transaction reference counts instead), account of what happened added,
 * claim sent, pooled into a case, taken by counsel. The first step not done is the current one. Pooling and counsel are
 * never done yet: there are no cases to pool into.
 * @param claim - The claim's progress fields.
 * @returns One state per step, in order.
 */
export function claimSteps(claim: ClaimProgress) {
  const done = [
    true,
    claim.paymentMethod !== 'wallet' || claim.ownership === 'signed',
    Boolean(claim.statement),
    claim.status === 'submitted',
    false,
    false,
  ];
  const current = done.indexOf(false);

  return done.map((isDone, i): StepState => {
    if (isDone) {
      return 'done';
    }

    return i === current ? 'current' : 'todo';
  });
}

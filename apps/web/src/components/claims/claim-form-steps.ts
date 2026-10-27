import type { PaymentMethod } from '@celia/core';

/** The steps of the claim form, in the order they appear. */
export type ClaimStep = 'what' | 'pay' | 'wallet' | 'payment' | 'who' | 'more';

/**
 * The steps this claim goes through. A wallet payment has a step about the wallet; paying by exchange, ATM or person has no
 * wallet to ask about, so it skips that step.
 * @param method - How the money was paid.
 * @returns The steps, in order.
 */
export function claimFormSteps(method: PaymentMethod): ClaimStep[] {
  return method === 'wallet'
    ? ['what', 'pay', 'wallet', 'payment', 'who', 'more']
    : ['what', 'pay', 'payment', 'who', 'more'];
}

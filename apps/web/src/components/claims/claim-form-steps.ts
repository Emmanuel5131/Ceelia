/** The steps of the claim form, in the order they appear. */
export type ClaimStep = 'what' | 'pay' | 'payment' | 'who' | 'more';

/** Every claim goes through the same five steps. A wallet payment asks about the wallet on the "pay" step. */
export const claimFormSteps: ClaimStep[] = ['what', 'pay', 'payment', 'who', 'more'];

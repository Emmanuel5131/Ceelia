/**
 * The chain families. A family shares an address format and a way of signing a message, so the
 * checks are written once per family. `other` stands for chains we cannot check yet: the claim is filed, but nothing can be confirmed on it.
 */
export const chainFamilies = ['evm', 'solana', 'tron', 'bitcoin', 'other'] as const;

export type ChainFamily = (typeof chainFamilies)[number];

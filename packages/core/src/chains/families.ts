/**
 * The chain families a claim can be filed for. A family shares an address format and a way of signing a message, so the
 * checks are written once per family. `other` accepts any chain: the claim is filed, but nothing can be checked on it yet.
 */
export const chainFamilies = ['evm', 'solana', 'tron', 'bitcoin', 'other'] as const;

export type ChainFamily = (typeof chainFamilies)[number];

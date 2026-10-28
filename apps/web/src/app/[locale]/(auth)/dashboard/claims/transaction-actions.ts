'use server';

import { chainIds, isValidTxHash } from '@celia/core';
import { auth } from '@clerk/nextjs/server';
import * as z from 'zod';
import { lookUpTransaction } from '@/libs/TxLookup';
import { walletRole } from '@/utils/Transaction';
import type { TxLookup, WalletRole } from '@/utils/Transaction';

const CheckValidation = z.object({
  chain: z.enum(chainIds),
  hash: z.string().trim().min(1).max(200),
  wallet: z.string().trim().max(200),
});

export type TxCheckResult = { lookup: TxLookup; role: WalletRole | null };

/**
 * Looks a transaction up on the chain for the person filling in a claim, so they can see it is the transfer they mean and that
 * it involves their wallet. It reads a public node and stores nothing. Only a signed-in person may ask.
 * @param input - The chain, the transaction hash and the wallet in the claim, which may be empty.
 * @returns What the chain shows, and how the wallet appears in it, or null for the role when there is no wallet to compare.
 */
export async function checkTransaction(input: {
  chain: string;
  hash: string;
  wallet: string;
}): Promise<TxCheckResult> {
  const { userId } = await auth();
  const parsed = CheckValidation.safeParse(input);

  if (!userId || !parsed.success || !isValidTxHash(parsed.data.chain, parsed.data.hash)) {
    return { lookup: { status: 'not_found' }, role: null };
  }

  const lookup = await lookUpTransaction(parsed.data.chain, parsed.data.hash);

  return {
    lookup,
    role:
      lookup.status === 'found' && parsed.data.wallet
        ? walletRole(lookup.facts, parsed.data.wallet)
        : null,
  };
}

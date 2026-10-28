import type { ChainId } from '@celia/core';
import { lookUpTransaction } from '@/libs/claims/TxLookup';
import { toStoredCheck } from '@/utils/claims/Transaction';
import type { StoredCheck } from '@/utils/claims/Transaction';

async function checkOne(chain: ChainId, hash: string | null | undefined, wallet: string) {
  return hash ? toStoredCheck(await lookUpTransaction(chain, hash), wallet, new Date()) : null;
}

/**
 * Asks the chain about the transactions in a claim, so what it shows is kept with the claim. A transaction the chain could not be
 * asked about keeps nothing. Both are asked at once, so saving a claim waits for one lookup, not two.
 * @param claim - The claim's chain, wallet and transactions.
 * @param claim.chain - The chain.
 * @param claim.walletAddress - The wallet, when the money left from the person's own wallet.
 * @param claim.txHash - The transaction that sent the money.
 * @param claim.fundingTxHash - The transaction that funded the wallet.
 * @returns What to keep for each.
 */
export async function checkClaimTransactions(claim: {
  chain: ChainId;
  walletAddress?: string | null;
  txHash?: string | null;
  fundingTxHash?: string | null;
}): Promise<{ txCheck: StoredCheck | null; fundingTxCheck: StoredCheck | null }> {
  const wallet = claim.walletAddress ?? '';
  const [txCheck, fundingTxCheck] = await Promise.all([
    checkOne(claim.chain, claim.txHash, wallet),
    checkOne(claim.chain, claim.fundingTxHash, wallet),
  ]);

  return { txCheck, fundingTxCheck };
}

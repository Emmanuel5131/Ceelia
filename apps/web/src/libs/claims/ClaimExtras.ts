import type { ChainId } from '@celia/core';
import { asc, eq, inArray } from 'drizzle-orm';
import { lookUpTransaction } from '@/libs/claims/TxLookup';
import { db } from '@/libs/DB';
import type { Executor } from '@/libs/notifications/Notify';
import { claimAddressSchema, claimTransactionSchema } from '@/models/Schema';
import { toStoredCheck } from '@/utils/claims/Transaction';

/** The extra wallets and transactions on a claim, as the form takes and gives them. */
export type ClaimExtras = {
  affected: { chain: ChainId; value: string }[];
  receiving: { chain: ChainId; value: string }[];
  transactions: { chain: ChainId; value: string }[];
};

/**
 * Asks each chain about the extra transactions, so what it shows is kept with them. They are asked at once, so saving a claim
 * waits for the slowest lookup, not for all of them in turn. A transaction the chain could not be asked about keeps nothing.
 * @param transactions - The extra transactions.
 * @param wallet - The claim's main wallet, to say how it appears in each.
 * @returns The check for each, in the same order.
 */
export async function checkExtraTransactions(
  transactions: ClaimExtras['transactions'],
  wallet: string,
) {
  return await Promise.all(
    transactions.map(async (row) =>
      toStoredCheck(await lookUpTransaction(row.chain, row.value), wallet, new Date()),
    ),
  );
}

/**
 * Saves the extra wallets and transactions of a claim, replacing what it had. Call it in the same transaction as the claim, so a
 * claim never has half its evidence.
 * @param executor - The database or a transaction.
 * @param claimId - The claim.
 * @param extras - The extra wallets and transactions.
 * @param checks - What each chain showed for each extra transaction, in order.
 */
export async function replaceClaimExtras(
  executor: Executor,
  claimId: string,
  extras: ClaimExtras,
  checks: Awaited<ReturnType<typeof checkExtraTransactions>>,
) {
  await executor.delete(claimAddressSchema).where(eq(claimAddressSchema.claimId, claimId));
  await executor.delete(claimTransactionSchema).where(eq(claimTransactionSchema.claimId, claimId));

  const addresses = [
    ...extras.affected.map((row) => ({ role: 'affected' as const, ...row })),
    ...extras.receiving.map((row) => ({ role: 'receiving' as const, ...row })),
  ];

  if (addresses.length > 0) {
    await executor
      .insert(claimAddressSchema)
      .values(
        addresses.map((row) => ({ claimId, role: row.role, chain: row.chain, address: row.value })),
      );
  }

  if (extras.transactions.length > 0) {
    await executor.insert(claimTransactionSchema).values(
      extras.transactions.map((row, index) => ({
        claimId,
        chain: row.chain,
        hash: row.value,
        check: checks[index] ?? null,
      })),
    );
  }
}

/**
 * Removes the extra wallets and transactions of claims, for when the claims themselves are deleted.
 * @param executor - The database or a transaction.
 * @param claimIds - The claims.
 */
export async function deleteClaimExtras(executor: Executor, claimIds: string[]) {
  await executor.delete(claimAddressSchema).where(inArray(claimAddressSchema.claimId, claimIds));
  await executor
    .delete(claimTransactionSchema)
    .where(inArray(claimTransactionSchema.claimId, claimIds));
}

/**
 * Reads the extra wallets and transactions of a claim, oldest first.
 * @param claimId - The claim.
 * @returns The wallets by role and the transactions with what the chain showed for each.
 */
export async function listClaimExtras(claimId: string) {
  const [addresses, transactions] = await Promise.all([
    db
      .select()
      .from(claimAddressSchema)
      .where(eq(claimAddressSchema.claimId, claimId))
      .orderBy(asc(claimAddressSchema.createdAt)),
    db
      .select()
      .from(claimTransactionSchema)
      .where(eq(claimTransactionSchema.claimId, claimId))
      .orderBy(asc(claimTransactionSchema.createdAt)),
  ]);

  return {
    affected: addresses.filter((row) => row.role === 'affected'),
    receiving: addresses.filter((row) => row.role === 'receiving'),
    transactions,
  };
}

export type ClaimExtrasView = Awaited<ReturnType<typeof listClaimExtras>>;

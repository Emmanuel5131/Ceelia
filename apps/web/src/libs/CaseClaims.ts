import type { FraudType } from '@celia/core';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { caseSchema, caseTeamSchema, claimSchema } from '@/models/Schema';

/** What a case's claim list shows. No statement, nonce or signature: those only appear in the single claim view. */
const listColumns = {
  id: claimSchema.id,
  userId: claimSchema.userId,
  fraudType: claimSchema.fraudType,
  paymentMethod: claimSchema.paymentMethod,
  walletType: claimSchema.walletType,
  walletApp: claimSchema.walletApp,
  accountKind: claimSchema.accountKind,
  fundingTxHash: claimSchema.fundingTxHash,
  destinationAddress: claimSchema.destinationAddress,
  firstPaymentOn: claimSchema.firstPaymentOn,
  lastPaymentOn: claimSchema.lastPaymentOn,
  assetSent: claimSchema.assetSent,
  tokenName: claimSchema.tokenName,
  fraudDescription: claimSchema.fraudDescription,
  tokenContract: claimSchema.tokenContract,
  chain: claimSchema.chain,
  walletAddress: claimSchema.walletAddress,
  txHash: claimSchema.txHash,
  platformName: claimSchema.platformName,
  amountLost: claimSchema.amountLost,
  country: claimSchema.country,
  ownership: claimSchema.ownership,
  contactChannel: claimSchema.contactChannel,
  submittedAt: claimSchema.submittedAt,
};

/**
 * Whether a person may see the claims in a case: Celia staff, and the lawyer who leads the case. Nobody else, because the link
 * between a person and their wallet and their statement go only to the lawyer handling the case.
 * @param viewer - The signed-in person.
 * @param viewer.userId - Their Clerk user id.
 * @param viewer.staff - Whether they are Celia staff.
 * @param caseId - The case id.
 * @returns True when they may.
 */
export async function canViewCaseClaims(
  viewer: { userId: string; staff: boolean },
  caseId: string,
) {
  if (viewer.staff) {
    return true;
  }

  const [lead] = await db
    .select({ id: caseTeamSchema.id })
    .from(caseTeamSchema)
    .where(
      and(
        eq(caseTeamSchema.caseId, caseId),
        eq(caseTeamSchema.userId, viewer.userId),
        eq(caseTeamSchema.role, 'lead'),
      ),
    );

  return lead !== undefined;
}

/**
 * The submitted claims in a case: those against the same platform, oldest first.
 * @param caseId - The case id.
 * @returns The claims, with the columns a list needs.
 */
export function listCaseClaims(caseId: string) {
  return db
    .select(listColumns)
    .from(claimSchema)
    .innerJoin(caseSchema, eq(caseSchema.platformKey, claimSchema.platformKey))
    .where(and(eq(caseSchema.id, caseId), eq(claimSchema.status, 'submitted')))
    .orderBy(asc(claimSchema.submittedAt));
}

/**
 * One submitted claim in a case, with the person's statement. A claim that is not in this case looks like one that does not
 * exist.
 * @param caseId - The case id.
 * @param claimId - The claim id.
 * @returns The claim, or undefined.
 */
export async function getCaseClaim(caseId: string, claimId: string) {
  const [row] = await db
    .select({ ...listColumns, statement: claimSchema.statement })
    .from(claimSchema)
    .innerJoin(caseSchema, eq(caseSchema.platformKey, claimSchema.platformKey))
    .where(
      and(
        eq(caseSchema.id, caseId),
        eq(claimSchema.id, claimId),
        eq(claimSchema.status, 'submitted'),
      ),
    );

  return row;
}

/**
 * What claimants say happened, in counts: the most reported kind of loss, how many claims there are, and how many of them are
 * confirmed (the claimant has proven they own the wallet) rather than unconfirmed.
 */
export type ReportedPattern = { type: FraudType; count: number; total: number; confirmed: number };

/**
 * The kind of loss most claimants in a case report, and how many of the claims are confirmed, as counts only. It names no one and
 * shows no statement. A case with a single claim has none, because one count would point at one person.
 * @param caseId - The case id.
 * @returns The most reported kind with the counts, or null.
 */
export async function reportedPattern(caseId: string): Promise<ReportedPattern | null> {
  const rows = await db
    .select({ fraudTypes: claimSchema.fraudTypes, ownership: claimSchema.ownership })
    .from(claimSchema)
    .innerJoin(caseSchema, eq(caseSchema.platformKey, claimSchema.platformKey))
    .where(and(eq(caseSchema.id, caseId), eq(claimSchema.status, 'submitted')));
  const total = rows.length;
  const confirmed = rows.filter((row) => row.ownership === 'signed').length;
  const perType = new Map<FraudType, number>();

  // A claim can fit several kinds, and counts once under each.
  for (const row of rows) {
    for (const type of new Set(row.fraudTypes)) {
      perType.set(type, (perType.get(type) ?? 0) + 1);
    }
  }

  const [top] = [...perType.entries()].toSorted((a, b) => b[1] - a[1]);

  return top && total >= 2 ? { type: top[0], count: top[1], total, confirmed } : null;
}

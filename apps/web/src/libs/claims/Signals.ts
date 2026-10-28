import { and, between, eq, inArray, ne, or, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { claimSchema } from '@/models/Schema';
import { burst, inBurst, transactionSignals } from '@/utils/claims/Signals';
import type { ClaimSignal } from '@/utils/claims/Signals';

/** What the checks need to know about one claim. */
export type SignalInput = Pick<
  typeof claimSchema.$inferSelect,
  | 'id'
  | 'userId'
  | 'chain'
  | 'walletAddress'
  | 'txHash'
  | 'fundingTxHash'
  | 'txCheck'
  | 'platformKey'
  | 'submittedAt'
>;

const lower = (value: string | null) => value?.trim().toLowerCase() ?? '';
const present = (values: (string | null)[]) => [...new Set(values.map(lower).filter(Boolean))];
const lowered = (column: typeof claimSchema.walletAddress | typeof claimSchema.txHash) =>
  sql<string>`lower(${column})`;

/**
 * Finds the reasons to look closer at claims, by comparing each with other people's claims and with what the chain showed. It
 * asks the database a few times for the whole list rather than once per claim.
 * @param claims - The claims to check.
 * @returns The signals for each claim id; a claim with none is not in the map.
 */
export async function signalsFor(claims: SignalInput[]) {
  const wallets = present(claims.map((claim) => claim.walletAddress));
  const hashes = present(claims.flatMap((claim) => [claim.txHash, claim.fundingTxHash]));
  const keys = [
    ...new Set(claims.flatMap((claim) => (claim.platformKey ? [claim.platformKey] : []))),
  ];
  const times = claims.flatMap((claim) => (claim.submittedAt ? [claim.submittedAt.getTime()] : []));

  const [shared, batch] = await Promise.all([
    wallets.length + hashes.length === 0
      ? []
      : db
          .select({
            userId: claimSchema.userId,
            walletAddress: claimSchema.walletAddress,
            txHash: claimSchema.txHash,
            fundingTxHash: claimSchema.fundingTxHash,
            ownership: claimSchema.ownership,
          })
          .from(claimSchema)
          .where(
            or(
              wallets.length > 0 ? inArray(lowered(claimSchema.walletAddress), wallets) : undefined,
              hashes.length > 0 ? inArray(lowered(claimSchema.txHash), hashes) : undefined,
              hashes.length > 0
                ? inArray(sql<string>`lower(${claimSchema.fundingTxHash})`, hashes)
                : undefined,
            ),
          ),
    keys.length === 0 || times.length === 0
      ? []
      : db
          .select({
            userId: claimSchema.userId,
            platformKey: claimSchema.platformKey,
            submittedAt: claimSchema.submittedAt,
          })
          .from(claimSchema)
          .where(
            and(
              inArray(claimSchema.platformKey, keys),
              eq(claimSchema.status, 'submitted'),
              between(
                claimSchema.submittedAt,
                new Date(Math.min(...times) - burst.windowMs),
                new Date(Math.max(...times) + burst.windowMs),
              ),
            ),
          ),
  ]);

  const result = new Map<string, ClaimSignal[]>();

  for (const claim of claims) {
    const wallet = lower(claim.walletAddress);
    const own = present([claim.txHash, claim.fundingTxHash]);
    const others = shared.filter((row) => row.userId !== claim.userId);
    const sameWallet = others.filter((row) => wallet && lower(row.walletAddress) === wallet);
    const signals: ClaimSignal[] = [
      ...(sameWallet.some((row) => row.ownership === 'signed')
        ? ['wallet_signed_elsewhere' as const]
        : []),
      ...(sameWallet.length > 0 ? ['wallet_shared' as const] : []),
      ...(others.some(
        (row) => own.includes(lower(row.txHash)) || own.includes(lower(row.fundingTxHash)),
      )
        ? ['tx_shared' as const]
        : []),
      ...transactionSignals(claim.txCheck),
      ...(claim.submittedAt &&
      inBurst(
        claim.submittedAt.getTime(),
        batch
          .filter((row) => row.platformKey === claim.platformKey && row.userId !== claim.userId)
          .flatMap((row) => (row.submittedAt ? [row.submittedAt.getTime()] : [])),
      )
        ? ['burst' as const]
        : []),
    ];

    if (signals.length > 0) {
      result.set(claim.id, signals);
    }
  }

  return result;
}

/**
 * How many claims a person has sent in the last day.
 * @param userId - The Clerk user id.
 * @returns The number of claims they sent.
 */
export async function countSentToday(userId: string) {
  const [row] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(claimSchema)
    .where(
      and(
        eq(claimSchema.userId, userId),
        ne(claimSchema.status, 'draft'),
        sql`${claimSchema.submittedAt} > now() - interval '1 day'`,
      ),
    );

  return row?.total ?? 0;
}

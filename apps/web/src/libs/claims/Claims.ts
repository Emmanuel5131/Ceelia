import { and, countDistinct, desc, eq, isNotNull, ne, or } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { claimSchema } from '@/models/Schema';

export type Claim = typeof claimSchema.$inferSelect;

/**
 * Lists a person's own claims, newest first.
 * @param userId - The Clerk user id.
 * @returns Their claims.
 */
export function listClaims(userId: string) {
  return db
    .select()
    .from(claimSchema)
    .where(eq(claimSchema.userId, userId))
    .orderBy(desc(claimSchema.createdAt));
}

/**
 * Reads one of a person's own claims. Asking for someone else's claim finds nothing.
 * @param userId - The Clerk user id of the person asking.
 * @param id - The claim id.
 * @returns The claim, or undefined.
 */
export async function getClaim(userId: string, id: string) {
  const [claim] = await db
    .select()
    .from(claimSchema)
    .where(and(eq(claimSchema.id, id), eq(claimSchema.userId, userId)));

  return claim;
}

/**
 * Counts how many other people have reported the same operator, counting only claims that staff have confirmed, so claims
 * nobody has checked cannot make an operator look bigger. Claims match when they share any strong identifier: the
 * name, the website, or the token contract. Only a number leaves here, never who they are.
 * @param claim - The claim whose operator to look at.
 * @returns The number of other people.
 */
export async function countOthersOnOperator(
  claim: Pick<Claim, 'platformKey' | 'platformHost' | 'tokenContract' | 'userId'>,
) {
  const matches = [
    claim.platformKey ? eq(claimSchema.platformKey, claim.platformKey) : undefined,
    claim.platformHost ? eq(claimSchema.platformHost, claim.platformHost) : undefined,
    claim.tokenContract ? eq(claimSchema.tokenContract, claim.tokenContract) : undefined,
  ].filter((match): match is SQL => match !== undefined);

  if (matches.length === 0) {
    return 0;
  }

  const [row] = await db
    .select({ others: countDistinct(claimSchema.userId) })
    .from(claimSchema)
    .where(
      and(or(...matches), ne(claimSchema.userId, claim.userId), isNotNull(claimSchema.validatedAt)),
    );

  return row?.others ?? 0;
}

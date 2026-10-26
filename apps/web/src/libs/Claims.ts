import { and, countDistinct, desc, eq, ne } from 'drizzle-orm';
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
 * Counts how many other people have reported the same platform. Only a number leaves here, never who they are.
 * @param claim - The claim whose platform to look at.
 * @returns The number of other people.
 */
export async function countOthersOnPlatform(claim: Pick<Claim, 'platformKey' | 'userId'>) {
  const [row] = await db
    .select({ others: countDistinct(claimSchema.userId) })
    .from(claimSchema)
    .where(
      and(eq(claimSchema.platformKey, claim.platformKey), ne(claimSchema.userId, claim.userId)),
    );

  return row?.others ?? 0;
}

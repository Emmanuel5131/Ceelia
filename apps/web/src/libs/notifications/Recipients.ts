import { and, eq } from 'drizzle-orm';
import type { Executor } from '@/libs/notifications/Notify';
import { counselProfileSchema, claimSchema } from '@/models/Schema';

/**
 * The people with a submitted claim against a platform: the claimants of its case.
 * @param executor - The database or a transaction.
 * @param platformKey - The platform's key.
 * @returns Their Clerk user ids, once each.
 */
export async function claimantIds(executor: Executor, platformKey: string) {
  const rows = await executor
    .selectDistinct({ userId: claimSchema.userId })
    .from(claimSchema)
    .where(and(eq(claimSchema.platformKey, platformKey), eq(claimSchema.status, 'submitted')));

  return rows.map((row) => row.userId);
}

/**
 * The verified lawyers, who can take a case.
 * @param executor - The database or a transaction.
 * @returns Their Clerk user ids.
 */
export async function verifiedCounselIds(executor: Executor) {
  const rows = await executor
    .select({ userId: counselProfileSchema.userId })
    .from(counselProfileSchema)
    .where(eq(counselProfileSchema.review, 'verified'));

  return rows.map((row) => row.userId);
}

import { and, eq } from 'drizzle-orm';
import type { Executor } from '@/libs/notifications/Notify';
import { counselProfileSchema, claimSchema } from '@/models/Schema';
import { isAdmittedFor } from '@/utils/cases/Admission';

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
 * The verified lawyers admitted where a case is, who can take it.
 * @param executor - The database or a transaction.
 * @param jurisdiction - The case's jurisdiction id.
 * @returns Their Clerk user ids.
 */
export async function counselIdsFor(executor: Executor, jurisdiction: string) {
  const rows = await executor
    .select({
      userId: counselProfileSchema.userId,
      jurisdictions: counselProfileSchema.jurisdictions,
    })
    .from(counselProfileSchema)
    .where(eq(counselProfileSchema.review, 'verified'));

  return rows
    .filter((row) => isAdmittedFor(row.jurisdictions, jurisdiction))
    .map((row) => row.userId);
}

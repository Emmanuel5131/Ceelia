import { eq } from 'drizzle-orm';
import type { Executor } from '@/libs/Notify';
import { counselProfileSchema } from '@/models/Schema';

/**
 * Keeps our copy of a lawyer in step with Clerk, which stays the source of truth. Call it right after every Clerk write about
 * a lawyer, so a search by review status or jurisdiction finds the same lawyers Clerk would.
 * @param executor - The database or a transaction.
 * @param profile - The lawyer's current details.
 * @param profile.userId - The Clerk user id.
 * @param profile.review - Whether staff have verified them.
 * @param profile.firm - Their firm, or null when independent.
 * @param profile.jurisdictions - The jurisdiction ids they are admitted in.
 */
export async function saveCounselProfile(
  executor: Executor,
  profile: {
    userId: string;
    review: 'pending' | 'verified';
    firm: string | null;
    jurisdictions: string[];
  },
) {
  await executor
    .insert(counselProfileSchema)
    .values(profile)
    .onConflictDoUpdate({
      target: counselProfileSchema.userId,
      set: { review: profile.review, firm: profile.firm, jurisdictions: profile.jurisdictions },
    });
}

/**
 * Changes only the review status of a lawyer we already hold.
 * @param executor - The database or a transaction.
 * @param userId - The Clerk user id.
 * @param review - The new status.
 */
export async function setCounselReview(
  executor: Executor,
  userId: string,
  review: 'pending' | 'verified',
) {
  await executor
    .update(counselProfileSchema)
    .set({ review })
    .where(eq(counselProfileSchema.userId, userId));
}

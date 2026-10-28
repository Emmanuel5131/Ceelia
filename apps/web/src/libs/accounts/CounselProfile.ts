import { eq } from 'drizzle-orm';
import type { Executor } from '@/libs/notifications/Notify';
import { counselProfileSchema, institutionApplicationSchema } from '@/models/Schema';
import { addWorkingDays, reviewDays } from '@/utils/accounts/Institution';
import type { InstitutionKind } from '@/utils/accounts/Institution';

/**
 * Keeps our copy of a lawyer in step with Clerk, which stays the source of truth. Call it right after every Clerk write about
 * a lawyer, so a search by review status or jurisdiction finds the same lawyers Clerk would.
 * @param executor - The database or a transaction.
 * @param profile - The lawyer's current details.
 * @param profile.userId - The Clerk user id.
 * @param profile.review - Whether staff have verified them.
 * @param profile.kind - What kind of professional or institution they are; left as it was when not given.
 * @param profile.firm - Their firm, or null when independent.
 * @param profile.jurisdictions - The jurisdiction ids they are admitted in.
 */
export async function saveCounselProfile(
  executor: Executor,
  profile: {
    userId: string;
    review: 'pending' | 'verified';
    kind?: InstitutionKind;
    firm: string | null;
    jurisdictions: string[];
  },
) {
  await executor
    .insert(counselProfileSchema)
    .values(profile)
    .onConflictDoUpdate({
      target: counselProfileSchema.userId,
      set: {
        review: profile.review,
        ...(profile.kind && { kind: profile.kind }),
        firm: profile.firm,
        jurisdictions: profile.jurisdictions,
      },
    });

  // Anyone waiting for review has an application on record: a new one, or one reopened when a verified lawyer's details changed.
  if (profile.review === 'pending') {
    const now = new Date();

    await executor
      .insert(institutionApplicationSchema)
      .values({
        userId: profile.userId,
        kind: profile.kind ?? 'law_firm',
        organisation: profile.firm,
        reviewDueAt: addWorkingDays(now, reviewDays),
      })
      .onConflictDoUpdate({
        target: institutionApplicationSchema.userId,
        set: {
          status: 'in_review',
          checks: {},
          readyBy: null,
          readyAt: null,
          decidedBy: null,
          decidedAt: null,
          decisionNote: null,
          submittedAt: now,
          reviewDueAt: addWorkingDays(now, reviewDays),
        },
        // Only an approved application is reopened here, when a verified lawyer's details changed. One still in review is left as it
        // is, and a rejected one stays rejected until the applicant applies again.
        setWhere: eq(institutionApplicationSchema.status, 'approved'),
      });
  }
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

/**
 * Records what an applicant told us when they applied: the organisation's details staff check against public records.
 * @param executor - The database or a transaction.
 * @param application - The details.
 * @param application.userId - The Clerk user id.
 * @param application.kind - What kind of professional or institution it is.
 * @param application.organisation - The firm or organisation; null when independent.
 * @param application.registrationNumber - The company registration or bar number.
 * @param application.website - Their website, if any.
 * @param application.contactRole - Their role there, if given.
 */
export async function saveApplicationDetails(
  executor: Executor,
  application: {
    userId: string;
    kind: InstitutionKind;
    organisation: string | null;
    registrationNumber: string;
    website: string | null;
    contactRole: string | null;
  },
) {
  await executor
    .update(institutionApplicationSchema)
    .set({
      kind: application.kind,
      organisation: application.organisation,
      registrationNumber: application.registrationNumber,
      website: application.website,
      contactRole: application.contactRole,
    })
    .where(eq(institutionApplicationSchema.userId, application.userId));
}

/**
 * Puts a rejected application back in review when the applicant applies again, with the checks and the old decision cleared and
 * a new review date.
 * @param executor - The database or a transaction.
 * @param userId - The Clerk user id.
 */
export async function reopenApplication(executor: Executor, userId: string) {
  const now = new Date();

  await executor
    .update(institutionApplicationSchema)
    .set({
      status: 'in_review',
      checks: {},
      lookups: null,
      lookedUpAt: null,
      readyBy: null,
      readyAt: null,
      decidedBy: null,
      decidedAt: null,
      decisionNote: null,
      submittedAt: now,
      reviewDueAt: addWorkingDays(now, reviewDays),
    })
    .where(eq(institutionApplicationSchema.userId, userId));
}

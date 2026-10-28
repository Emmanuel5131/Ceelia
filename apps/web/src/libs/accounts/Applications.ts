import { asc, eq } from 'drizzle-orm';
import { getUsersById } from '@/libs/accounts/ClerkUsers';
import { db } from '@/libs/DB';
import { counselProfileSchema, institutionApplicationSchema } from '@/models/Schema';
import { canReapply, emailDomainCheck, reapplyAfterDays } from '@/utils/accounts/Institution';

const addDays = (from: Date, days: number) => new Date(from.getTime() + days * 24 * 60 * 60 * 1000);

/**
 * Reads one person's application, for the notice they see while it is reviewed.
 * @param userId - The Clerk user id.
 * @returns Where it stands, when we aim to decide, and whether that date has passed, or undefined when they have none.
 */
export async function getApplication(userId: string) {
  const [row] = await db
    .select({
      status: institutionApplicationSchema.status,
      submittedAt: institutionApplicationSchema.submittedAt,
      reviewDueAt: institutionApplicationSchema.reviewDueAt,
      decisionNote: institutionApplicationSchema.decisionNote,
      decidedAt: institutionApplicationSchema.decidedAt,
    })
    .from(institutionApplicationSchema)
    .where(eq(institutionApplicationSchema.userId, userId));

  return (
    row && {
      ...row,
      overdue: row.reviewDueAt.getTime() < Date.now(),
      reapplyOn: row.decidedAt ? addDays(row.decidedAt, reapplyAfterDays) : null,
      canReapply:
        row.status === 'rejected' &&
        row.decidedAt !== null &&
        canReapply(row.decidedAt, new Date()),
    }
  );
}

/**
 * Lists the applications waiting for review, oldest first, with what staff check: who applied, the organisation's details and
 * whether the work email is on the organisation's own domain. The name and email come from Clerk and are only for staff.
 * @returns The applications in review.
 */
export async function listApplicationsInReview() {
  const rows = await db
    .select({
      application: institutionApplicationSchema,
      jurisdictions: counselProfileSchema.jurisdictions,
    })
    .from(institutionApplicationSchema)
    .leftJoin(
      counselProfileSchema,
      eq(counselProfileSchema.userId, institutionApplicationSchema.userId),
    )
    .where(eq(institutionApplicationSchema.status, 'in_review'))
    .orderBy(asc(institutionApplicationSchema.submittedAt));

  if (rows.length === 0) {
    return [];
  }

  const users = await getUsersById(rows.map((row) => row.application.userId));
  const now = Date.now();

  return rows.map(({ application, jurisdictions }) => {
    const user = users.get(application.userId);
    const email = user?.primaryEmailAddress?.emailAddress ?? '';

    return {
      id: application.userId,
      name: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
      email,
      domain: email ? emailDomainCheck(email, application.website) : 'unknown',
      kind: application.kind,
      organisation: application.organisation,
      registrationNumber: application.registrationNumber,
      website: application.website,
      contactRole: application.contactRole,
      jurisdictions: jurisdictions ?? [],
      checks: application.checks,
      lookups: application.lookups,
      lookedUpAt: application.lookedUpAt?.toISOString() ?? null,
      readyBy: application.readyBy,
      submittedAt: application.submittedAt.toISOString(),
      dueAt: application.reviewDueAt.toISOString(),
      overdue: application.reviewDueAt.getTime() < now,
    };
  });
}

export type ApplicationInReview = Awaited<ReturnType<typeof listApplicationsInReview>>[number];

/**
 * Reads what an applicant gave, to fill the form when they apply again.
 * @param userId - The Clerk user id.
 * @returns The details, or undefined when there is no application.
 */
export async function getApplicationForm(userId: string) {
  const [row] = await db
    .select({
      kind: institutionApplicationSchema.kind,
      registrationNumber: institutionApplicationSchema.registrationNumber,
      website: institutionApplicationSchema.website,
      contactRole: institutionApplicationSchema.contactRole,
      firm: institutionApplicationSchema.organisation,
      jurisdictions: counselProfileSchema.jurisdictions,
    })
    .from(institutionApplicationSchema)
    .leftJoin(
      counselProfileSchema,
      eq(counselProfileSchema.userId, institutionApplicationSchema.userId),
    )
    .where(eq(institutionApplicationSchema.userId, userId));

  return row && { ...row, jurisdictions: row.jurisdictions ?? [] };
}

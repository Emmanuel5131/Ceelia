'use server';

import { platformKey } from '@celia/core';
import { clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { setCounselReview } from '@/libs/CounselProfile';
import { db } from '@/libs/DB';
import { notify } from '@/libs/Notify';
import { claimantIds, counselIdsFor } from '@/libs/Recipients';
import { saveReport } from '@/libs/Reports';
import { requireStaff, syncCounselProfiles } from '@/libs/Staff';
import { unsuppress } from '@/libs/Suppression';
import { caseReportSchema, caseSchema, emailMessageSchema } from '@/models/Schema';
import { parseAccount } from '@/utils/Account';
import { caseStatuses } from '@/utils/Case';
import { hashReport } from '@/utils/Report';
import { NotebookUrlValidation, ReportValidation } from '@/validations/ReportValidation';

const CreateCaseValidation = z.object({
  name: z.string().trim().min(1).max(200),
  jurisdiction: z.string().trim().min(1).max(200),
});

/**
 * Marks a lawyer as verified. Only staff can, and only for an account that is counsel waiting for review, so this cannot be
 * used to give any other account the role.
 * @param userId - The Clerk user id of the lawyer.
 */
export async function verifyCounsel(userId: string) {
  await requireStaff();
  const client = await clerkClient();
  const target = await client.users.getUser(userId);
  const account = parseAccount(target.publicMetadata);

  if (account?.accountType !== 'counsel' || account.review !== 'pending') {
    return;
  }

  await client.users.updateUserMetadata(userId, { publicMetadata: { review: 'verified' } });
  await db.transaction(async (tx) => {
    await setCounselReview(tx, userId, 'verified');
    await notify(tx, [
      {
        userId,
        type: 'counsel_verified',
        // A lawyer can be verified more than once (after a review reset), so the key carries the minute.
        dedupeKey: `counsel_verified:${new Date().toISOString().slice(0, 16)}`,
      },
    ]);
  });
  revalidatePath('/', 'layout');
}

/**
 * Opens a case for a platform. The name is what Celia calls it until the platform consents to being named; the claims that
 * belong to it are the ones whose platform reduces to the same key.
 * @param formData - The submitted form.
 * @returns The names of the fields that failed, or `duplicate` when the platform already has a case.
 */
export async function createCase(formData: FormData) {
  await requireStaff();
  const parsed = CreateCaseValidation.safeParse({
    name: formData.get('name'),
    jurisdiction: formData.get('jurisdiction'),
  });

  if (!parsed.success) {
    return [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))];
  }

  const key = platformKey(parsed.data.name);
  const created = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(caseSchema)
      .values({ name: parsed.data.name, jurisdiction: parsed.data.jurisdiction, platformKey: key })
      .onConflictDoNothing()
      .returning({ id: caseSchema.id });

    if (!row) {
      return false;
    }

    // Claims already sent against this platform are part of the case from the start.
    const claimants = await claimantIds(tx, key);
    await notify(
      tx,
      claimants.map((userId) => ({
        userId,
        type: 'claim_in_case' as const,
        dedupeKey: `claim_in_case:${row.id}`,
        data: { caseId: row.id },
      })),
    );

    return true;
  });

  if (!created) {
    return ['duplicate'];
  }

  revalidatePath('/', 'layout');

  return [];
}

/**
 * Moves a case between the stages staff control. A case with counsel is not changed here: taking it set that status.
 * @param caseId - The case id.
 * @param status - The new status.
 */
export async function setCaseStatus(caseId: string, status: string) {
  await requireStaff();
  const parsed = z.enum(caseStatuses).safeParse(status);

  if (!parsed.success || parsed.data === 'counsel') {
    return;
  }

  const next = parsed.data;
  await db.transaction(async (tx) => {
    const [found] = await tx.select().from(caseSchema).where(eq(caseSchema.id, caseId));

    if (!found || found.status === 'counsel' || found.status === next) {
      return;
    }

    // A case cannot be sealed without a report: sealing says the evidence file is finished.
    if (next === 'sealed') {
      const [report] = await tx
        .select({ id: caseReportSchema.id })
        .from(caseReportSchema)
        .where(eq(caseReportSchema.caseId, caseId))
        .limit(1);

      if (!report) {
        return;
      }
    }

    await tx.update(caseSchema).set({ status: next }).where(eq(caseSchema.id, caseId));

    // Sealing is the one stage people are told about: claimants hear their evidence is final, and lawyers hear it can be taken.
    if (next === 'sealed') {
      const [claimants, counsel] = await Promise.all([
        claimantIds(tx, found.platformKey),
        counselIdsFor(tx, found.jurisdiction),
      ]);
      await notify(tx, [
        ...claimants.map((userId) => ({
          userId,
          type: 'case_sealed' as const,
          dedupeKey: `case_sealed:${caseId}`,
          data: { caseId },
        })),
        ...counsel.map((userId) => ({
          userId,
          type: 'case_ready_for_counsel' as const,
          dedupeKey: `case_ready_for_counsel:${caseId}`,
          data: { caseId },
        })),
      ]);
    }
  });
  revalidatePath('/', 'layout');
}

/**
 * Copies the lawyers in Clerk into our own table, for lawyers who signed up before it existed.
 */
export async function syncCounsel() {
  await requireStaff();
  await syncCounselProfiles();
  revalidatePath('/', 'layout');
}

/**
 * Puts a failed email back in the queue to be tried again, for when the cause (a wrong setting, a down server) is fixed.
 * @param id - The message id.
 */
export async function retryMail(id: string) {
  await requireStaff();
  await db
    .update(emailMessageSchema)
    .set({ status: 'pending', attempts: 0, nextAttemptAt: new Date(), lastError: null })
    .where(eq(emailMessageSchema.id, id));
  revalidatePath('/', 'layout');
}

/**
 * Lets mail go to an address again, after the reason it was stopped is fixed.
 * @param email - The address.
 */
export async function allowMail(email: string) {
  await requireStaff();
  await unsuppress(email);
  revalidatePath('/', 'layout');
}

/**
 * Saves a report for a case from the findings JSON an analysis produced. The text is checked against the report format and the
 * house language, hashed, and stored as a new version. Staff review it first: this is the last check before it is shown to
 * lawyers.
 * @param caseId - The case id.
 * @param formData - The form with `report` (the JSON) and optionally `notebookUrl`.
 * @returns The problems found, or none when saved: `json`, `schema`, `words` or `url`.
 */
export async function saveCaseReport(caseId: string, formData: FormData) {
  const user = await requireStaff();
  const raw = formData.get('report');
  const notebook = formData.get('notebookUrl');
  const link = typeof notebook === 'string' ? notebook.trim() : '';
  let json: unknown;

  // Pasted text may be anything, so parsing it is the one place a throw is expected.
  try {
    json = JSON.parse(typeof raw === 'string' ? raw : '');
  } catch {
    return ['json'];
  }

  const parsed = ReportValidation.safeParse(json);

  if (!parsed.success) {
    return parsed.error.issues.some((issue) => issue.message === 'forbidden_words')
      ? ['words']
      : ['schema'];
  }

  const url = link === '' ? null : NotebookUrlValidation.safeParse(link);

  if (url && !url.success) {
    return ['url'];
  }

  await saveReport({
    caseId,
    snapshot: parsed.data,
    hash: hashReport(parsed.data),
    notebookUrl: url?.data ?? null,
    savedBy: user.id,
  });
  revalidatePath('/', 'layout');

  return [];
}

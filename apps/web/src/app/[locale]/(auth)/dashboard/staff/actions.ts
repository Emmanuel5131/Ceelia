'use server';

import { getJurisdiction } from '@celia/jurisdictions';
import { clerkClient } from '@clerk/nextjs/server';
import { and, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { setCounselReview } from '@/libs/accounts/CounselProfile';
import { lookupRegistry, lookupSanctions } from '@/libs/accounts/Lookups';
import { requireStaff, syncCounselProfiles } from '@/libs/accounts/Staff';
import { recordStaffAction, staffActor } from '@/libs/accounts/StaffAudit';
import { recordCaseEvent } from '@/libs/cases/CaseEvents';
import { addConfirmedClaim } from '@/libs/cases/Cases';
import { saveReport } from '@/libs/cases/Reports';
import { signalsFor } from '@/libs/claims/Signals';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { notify } from '@/libs/notifications/Notify';
import { claimantIds, verifiedCounselIds } from '@/libs/notifications/Recipients';
import { unsuppress } from '@/libs/notifications/Suppression';
import {
  caseReportSchema,
  caseSchema,
  claimProofSchema,
  claimSchema,
  emailMessageSchema,
  institutionApplicationSchema,
} from '@/models/Schema';
import { parseAccount } from '@/utils/accounts/Account';
import { approvalRefusal, reviewChecks } from '@/utils/accounts/Institution';
import { caseStatuses } from '@/utils/cases/Case';
import { hashReport } from '@/utils/cases/Report';
import { forbiddenWords, ReportValidation } from '@/validations/ReportValidation';

// Notes on who is alleged to have run a platform. The house language applies: they record what is alleged, they do not declare fraud.
const CaseOperatorsValidation = z.object({
  operators: z
    .string()
    .trim()
    .max(3000)
    .refine((value) => !forbiddenWords.test(value), { message: 'forbidden_words' }),
});

const ApplicationCheckValidation = z.object({
  userId: z.string().min(1),
  check: z.enum(reviewChecks),
  value: z.boolean(),
});

/**
 * Ticks or unticks one check on an application in review. Changing a check after it was marked ready takes the mark off, so the
 * person who approves always approves what was last checked.
 * @param input - The application, the check and whether it passed.
 * @param input.userId - The applicant's Clerk user id.
 * @param input.check - Which check.
 * @param input.value - Whether it passed.
 */
export async function setApplicationCheck(input: {
  userId: string;
  check: string;
  value: boolean;
}) {
  const staff = await requireStaff();
  const parsed = ApplicationCheckValidation.safeParse(input);

  if (!parsed.success) {
    return;
  }

  const { userId, check, value } = parsed.data;
  await db.transaction(async (tx) => {
    const [found] = await tx
      .select({ checks: institutionApplicationSchema.checks })
      .from(institutionApplicationSchema)
      .where(
        and(
          eq(institutionApplicationSchema.userId, userId),
          eq(institutionApplicationSchema.status, 'in_review'),
        ),
      );

    if (!found) {
      return;
    }

    await tx
      .update(institutionApplicationSchema)
      .set({ checks: { ...found.checks, [check]: value }, readyBy: null, readyAt: null })
      .where(eq(institutionApplicationSchema.userId, userId));
    await recordStaffAction(tx, {
      actor: staffActor(staff),
      action: 'application_checked',
      target: { type: 'application', id: userId },
      details: { check, value: String(value) },
    });
  });
  revalidatePath('/', 'layout');
}

/**
 * Runs the registry and sanctions lookups for an application and keeps what they found, for staff to read. They inform the checks;
 * staff still tick each one themselves.
 * @param userId - The applicant's Clerk user id.
 */
export async function runApplicationLookups(userId: string) {
  const staff = await requireStaff();
  const [found] = await db
    .select({ organisation: institutionApplicationSchema.organisation })
    .from(institutionApplicationSchema)
    .where(
      and(
        eq(institutionApplicationSchema.userId, userId),
        eq(institutionApplicationSchema.status, 'in_review'),
      ),
    );

  if (!found) {
    return;
  }

  const client = await clerkClient();
  const applicant = await client.users.getUser(userId);
  const [registry, sanctions] = await Promise.all([
    lookupRegistry(found.organisation),
    lookupSanctions({
      organisation: found.organisation,
      person: [applicant.firstName, applicant.lastName].filter(Boolean).join(' '),
    }),
  ]);

  await db.transaction(async (tx) => {
    await tx
      .update(institutionApplicationSchema)
      .set({ lookups: { registry, sanctions }, lookedUpAt: new Date() })
      .where(eq(institutionApplicationSchema.userId, userId));
    await recordStaffAction(tx, {
      actor: staffActor(staff),
      action: 'application_lookup',
      target: { type: 'application', id: userId },
    });
  });
  revalidatePath('/', 'layout');
}

/**
 * Marks an application ready for a second person to approve. Every check must be ticked first.
 * @param userId - The applicant's Clerk user id.
 * @returns `checks_incomplete` when a check is still open; otherwise nothing.
 */
export async function markApplicationReady(
  userId: string,
): Promise<'ok' | 'missing' | 'checks_incomplete'> {
  const staff = await requireStaff();
  const result = await db.transaction(async (tx) => {
    const [found] = await tx
      .select({ checks: institutionApplicationSchema.checks })
      .from(institutionApplicationSchema)
      .where(
        and(
          eq(institutionApplicationSchema.userId, userId),
          eq(institutionApplicationSchema.status, 'in_review'),
        ),
      );

    if (!found) {
      return 'missing';
    }

    if (!reviewChecks.every((check) => found.checks[check] === true)) {
      return 'checks_incomplete';
    }

    await tx
      .update(institutionApplicationSchema)
      .set({ readyBy: staff.id, readyAt: new Date() })
      .where(eq(institutionApplicationSchema.userId, userId));
    await recordStaffAction(tx, {
      actor: staffActor(staff),
      action: 'application_ready',
      target: { type: 'application', id: userId },
    });

    return 'ok';
  });
  revalidatePath('/', 'layout');

  return result;
}

/**
 * Approves an application, which opens the account. It needs every check ticked and a second person: the one who marked it ready
 * cannot approve it in production. Only an account that is counsel and waiting for review can be approved, so this cannot be used
 * to give any other account the role.
 * @param userId - The applicant's Clerk user id.
 * @returns The reason it was refused, or `ok`.
 */
export async function approveApplication(
  userId: string,
): Promise<'ok' | 'missing' | 'checks_incomplete' | 'not_ready' | 'same_person'> {
  const staff = await requireStaff();
  const [found] = await db
    .select()
    .from(institutionApplicationSchema)
    .where(
      and(
        eq(institutionApplicationSchema.userId, userId),
        eq(institutionApplicationSchema.status, 'in_review'),
      ),
    );

  if (!found) {
    return 'missing';
  }

  const refusal = approvalRefusal({
    checks: found.checks,
    readyBy: found.readyBy,
    actor: staff.id,
    production: Env.NODE_ENV === 'production',
  });

  if (refusal !== 'ok') {
    return refusal;
  }

  const client = await clerkClient();
  const target = await client.users.getUser(userId);
  const account = parseAccount(target.publicMetadata);

  if (account?.accountType !== 'counsel' || account.review !== 'pending') {
    return 'missing';
  }

  await client.users.updateUserMetadata(userId, { publicMetadata: { review: 'verified' } });
  await db.transaction(async (tx) => {
    await tx
      .update(institutionApplicationSchema)
      .set({
        status: 'approved',
        decidedBy: staff.id,
        decidedAt: new Date(),
      })
      .where(eq(institutionApplicationSchema.userId, userId));
    await setCounselReview(tx, userId, 'verified');
    await recordStaffAction(tx, {
      actor: staffActor(staff),
      action: 'application_approved',
      target: { type: 'application', id: userId },
    });
    await notify(tx, [
      {
        userId,
        type: 'counsel_verified',
        // A lawyer can be approved more than once (after a review reset), so the key carries the minute.
        dedupeKey: `counsel_verified:${new Date().toISOString().slice(0, 16)}`,
      },
    ]);
  });
  revalidatePath('/', 'layout');

  return 'ok';
}

const RejectionValidation = z.object({
  userId: z.string().min(1),
  note: z.string().trim().min(1).max(500),
});

/**
 * Rejects an application. The reason is kept and shown to the applicant; the account stays without access.
 * @param input - The applicant and the reason.
 * @param input.userId - The applicant's Clerk user id.
 * @param input.note - Why, in a sentence or two.
 * @returns `note` when the reason is missing; otherwise nothing.
 */
export async function rejectApplication(input: {
  userId: string;
  note: string;
}): Promise<'ok' | 'note'> {
  const staff = await requireStaff();
  const parsed = RejectionValidation.safeParse(input);

  if (!parsed.success) {
    return 'note';
  }

  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(institutionApplicationSchema)
      .set({
        status: 'rejected',
        decidedBy: staff.id,
        decidedAt: new Date(),
        decisionNote: parsed.data.note,
      })
      .where(
        and(
          eq(institutionApplicationSchema.userId, parsed.data.userId),
          eq(institutionApplicationSchema.status, 'in_review'),
        ),
      )
      .returning({ userId: institutionApplicationSchema.userId });

    if (updated) {
      await recordStaffAction(tx, {
        actor: staffActor(staff),
        action: 'application_rejected',
        target: { type: 'application', id: updated.userId },
      });
      await notify(tx, [
        {
          userId: updated.userId,
          type: 'application_rejected',
          dedupeKey: `application_rejected:${updated.userId}:${new Date().toISOString().slice(0, 16)}`,
        },
      ]);
    }
  });
  revalidatePath('/', 'layout');

  return 'ok';
}

/** What a batch did: how many it changed and how many it left alone because they had changed or could not be done. */
export type BulkResult = { done: number; skipped: number };

const ids = z.array(z.uuid()).min(1).max(100);

const WalletsValidation = z.object({
  claimIds: ids,
  decision: z.enum(['confirm', 'decline']),
  note: z.string().trim().max(500),
});

type Staff = Awaited<ReturnType<typeof requireStaff>>;

/**
 * Settles one wallet inside a transaction. Confirming marks the evidence as reviewed and, if the wallet was not already
 * confirmed by a signature, confirms it as checked by staff and tells the person. Declining deletes their files and forgets
 * their link so they are not kept; a wallet confirmed by signature stays confirmed.
 * @param tx - The transaction.
 * @param staff - The staff member.
 * @param settle - What to do.
 * @param settle.claimId - The claim.
 * @param settle.decision - `confirm` or `decline`.
 * @param settle.note - Why it was declined.
 * @returns True when it was changed; false when it was no longer waiting.
 */
async function settleWallet(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  staff: Staff,
  settle: { claimId: string; decision: 'confirm' | 'decline'; note: string },
) {
  const { claimId, decision, note } = settle;
  const [claim] = await tx
    .select({ userId: claimSchema.userId, ownership: claimSchema.ownership })
    .from(claimSchema)
    .where(
      and(
        eq(claimSchema.id, claimId),
        isNotNull(claimSchema.reviewRequestedAt),
        isNull(claimSchema.reviewedAt),
      ),
    );

  if (!claim) {
    return false;
  }

  if (decision === 'decline') {
    await tx.delete(claimProofSchema).where(eq(claimProofSchema.claimId, claimId));
    await tx
      .update(claimSchema)
      .set({
        ownership: claim.ownership === 'review' ? 'unsigned' : claim.ownership,
        reviewNote: note,
        reviewVideoUrl: null,
        proofNote: null,
        reviewRequestedAt: null,
      })
      .where(eq(claimSchema.id, claimId));
    await recordStaffAction(tx, {
      actor: staffActor(staff),
      action: 'ownership_declined',
      target: { type: 'claim', id: claimId },
    });

    return true;
  }

  const confirming = claim.ownership !== 'signed';

  await tx
    .update(claimSchema)
    .set({
      reviewedAt: new Date(),
      reviewNote: null,
      ...(confirming && { ownership: 'signed', ownershipMethod: 'staff', signedAt: new Date() }),
    })
    .where(eq(claimSchema.id, claimId));
  await recordStaffAction(tx, {
    actor: staffActor(staff),
    action: 'ownership_confirmed',
    target: { type: 'claim', id: claimId },
    details: { method: confirming ? 'staff' : 'signature' },
  });

  if (confirming) {
    await notify(tx, [
      {
        userId: claim.userId,
        type: 'ownership_confirmed',
        dedupeKey: `ownership_confirmed:${claimId}`,
        data: { claimId },
      },
    ]);
  }

  return true;
}

/**
 * Settles what people sent to show their wallets are theirs, a video, files or both: one wallet or a selection of up to 100, all
 * with the same decision. A decline needs a short reason, which each person sees. A wallet that was settled by someone else in the
 * meantime is left alone and counted as skipped, so a batch is never refused because one item changed.
 * @param input - The claims, the decision and, for a decline, the reason.
 * @param input.claimIds - The claims.
 * @param input.decision - `confirm` or `decline`.
 * @param input.note - Why it was declined.
 * @returns How many were changed and skipped, or `error` when the decision or the reason is missing.
 */
export async function settleWallets(input: {
  claimIds: string[];
  decision: string;
  note: string;
}): Promise<BulkResult & { error?: 'decision' | 'note' }> {
  const staff = await requireStaff();
  const parsed = WalletsValidation.safeParse(input);

  if (!parsed.success) {
    return { done: 0, skipped: 0, error: 'decision' };
  }

  const { claimIds, decision, note } = parsed.data;

  if (decision === 'decline' && !note) {
    return { done: 0, skipped: 0, error: 'note' };
  }

  const results = await db.transaction(async (tx) => {
    const settled: boolean[] = [];

    for (const claimId of claimIds) {
      // The queries share one connection and run one at a time anyway, so a loop is no slower than doing them together.
      // oxlint-disable-next-line no-await-in-loop
      settled.push(await settleWallet(tx, staff, { claimId, decision, note }));
    }

    return settled;
  });
  revalidatePath('/', 'layout');
  const done = results.filter(Boolean).length;

  return { done, skipped: results.length - done };
}

/**
 * Validates one sent claim inside a transaction: staff have checked it and the evidence the person added. It only works on a claim
 * that was sent and not validated yet, and it tells the person.
 * @param tx - The transaction.
 * @param staff - The staff member.
 * @param claimId - The claim.
 * @returns True when it was validated; false when it was no longer waiting.
 */
async function validateOne(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  staff: Staff,
  claimId: string,
) {
  const [claim] = await tx
    .update(claimSchema)
    .set({ validatedAt: new Date() })
    .where(
      and(
        eq(claimSchema.id, claimId),
        eq(claimSchema.status, 'submitted'),
        isNull(claimSchema.validatedAt),
      ),
    )
    .returning({
      userId: claimSchema.userId,
      platformKey: claimSchema.platformKey,
      platformName: claimSchema.platformName,
    });

  if (!claim) {
    return false;
  }

  // The first confirmed claim for a platform opens its case; more of them move it on.
  const caseId = await addConfirmedClaim(tx, claim);

  await recordStaffAction(tx, {
    actor: staffActor(staff),
    action: 'claim_validated',
    target: { type: 'claim', id: claimId },
  });
  await notify(tx, [
    {
      userId: claim.userId,
      type: 'claim_validated',
      dedupeKey: `claim_validated:${claimId}`,
      data: { claimId },
    },
    ...(caseId
      ? [
          {
            userId: claim.userId,
            type: 'claim_in_case' as const,
            dedupeKey: `claim_in_case:${caseId}`,
            data: { caseId },
          },
        ]
      : []),
  ]);

  return true;
}

/**
 * Validates sent claims: one or a selection of up to 100. A claim for a wallet that another person has proved they control, when
 * this claim has not proved it, is refused and counted as skipped, as is one that was validated in the meantime. The rest are
 * validated and each person is told.
 * @param claimIds - The claims.
 * @returns How many were validated and how many were skipped.
 */
export async function validateClaims(claimIds: string[]): Promise<BulkResult> {
  const staff = await requireStaff();
  const parsed = ids.safeParse(claimIds);

  if (!parsed.success) {
    return { done: 0, skipped: 0 };
  }

  // A wallet someone else has already proved they control cannot be confirmed for a claim that has not proved it.
  const found = await db.select().from(claimSchema).where(inArray(claimSchema.id, parsed.data));
  const signals = await signalsFor(found);
  const blocked = new Set(
    found
      .filter(
        (claim) =>
          claim.ownership !== 'signed' &&
          signals.get(claim.id)?.includes('wallet_signed_elsewhere'),
      )
      .map((claim) => claim.id),
  );
  const allowed = parsed.data.filter((claimId) => !blocked.has(claimId));
  const results = await db.transaction(async (tx) => {
    const validated: boolean[] = [];

    for (const claimId of allowed) {
      // Each claim reads what the one before it wrote: the first confirmed claim for a platform opens its case.
      // oxlint-disable-next-line no-await-in-loop
      validated.push(await validateOne(tx, staff, claimId));
    }

    return validated;
  });
  revalidatePath('/', 'layout');
  const done = results.filter(Boolean).length;

  return { done, skipped: parsed.data.length - done };
}

/**
 * Saves who the claimants allege ran a platform: notes with names and links, and the jurisdictions the operators are linked to.
 * An empty note and no jurisdictions clear them. The text must keep to the house language, because it records an allegation and never declares fraud.
 * @param caseId - The case id.
 * @param formData - The submitted form, with `operators` and any number of `jurisdictions`.
 * @returns The names of the fields that failed: `words` when the text declares fraud, `operators` when it is too long,
 *   `jurisdictions` when one is not a known jurisdiction.
 */
export async function saveCaseOperators(caseId: string, formData: FormData) {
  const staff = await requireStaff();
  const entry = formData.get('operators');
  const parsed = CaseOperatorsValidation.safeParse({
    operators: typeof entry === 'string' ? entry : '',
  });

  if (!parsed.success) {
    return parsed.error.issues.some((issue) => issue.message === 'forbidden_words')
      ? ['words']
      : ['operators'];
  }

  if (!z.uuid().safeParse(caseId).success) {
    return ['case'];
  }

  const jurisdictions = [
    ...new Set(
      formData.getAll('jurisdictions').filter((id) => typeof id === 'string' && id !== ''),
    ),
  ];

  if (
    jurisdictions.length > 20 ||
    !jurisdictions.every((id) => typeof id === 'string' && getJurisdiction(id))
  ) {
    return ['jurisdictions'];
  }

  await db.transaction(async (tx) => {
    const updated = await tx
      .update(caseSchema)
      .set({
        operators: parsed.data.operators || null,
        operatorJurisdictions: jurisdictions.filter((id) => typeof id === 'string'),
      })
      .where(eq(caseSchema.id, caseId))
      .returning({ id: caseSchema.id });

    if (updated.length === 0) {
      return;
    }

    await recordStaffAction(tx, {
      actor: staffActor(staff),
      action: 'case_operators_saved',
      target: { type: 'case', id: caseId },
    });
  });
  revalidatePath('/', 'layout');

  return [];
}

/**
 * Moves a case between the stages staff control: building and enough evidence.
 * @param caseId - The case id.
 * @param status - The new status.
 */
export async function setCaseStatus(caseId: string, status: string) {
  const staff = await requireStaff();
  const parsed = z.enum(caseStatuses).safeParse(status);

  if (!parsed.success) {
    return;
  }

  const next = parsed.data;
  await db.transaction(async (tx) => {
    const [found] = await tx.select().from(caseSchema).where(eq(caseSchema.id, caseId));

    if (!found || found.status === next) {
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
    await recordStaffAction(tx, {
      actor: staffActor(staff),
      action: 'case_status_set',
      target: { type: 'case', id: caseId },
      details: { status: next },
    });

    if (next === 'sealed') {
      await recordCaseEvent(tx, caseId, 'case_sealed');
    }

    // Sealing is the one stage people are told about: claimants hear their evidence is final, and lawyers hear it can be taken.
    if (next === 'sealed') {
      const [claimants, counsel] = await Promise.all([
        claimantIds(tx, found.platformKey),
        verifiedCounselIds(tx),
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
  const staff = await requireStaff();
  await syncCounselProfiles();
  await recordStaffAction(db, { actor: staffActor(staff), action: 'counsel_synced' });
  revalidatePath('/', 'layout');
}

/**
 * Puts a failed email back in the queue to be tried again, for when the cause (a wrong setting, a down server) is fixed.
 * @param id - The message id.
 */
export async function retryMail(id: string) {
  const staff = await requireStaff();
  await db
    .update(emailMessageSchema)
    .set({ status: 'pending', attempts: 0, nextAttemptAt: new Date(), lastError: null })
    .where(eq(emailMessageSchema.id, id));
  await recordStaffAction(db, {
    actor: staffActor(staff),
    action: 'mail_retried',
    target: { type: 'email', id },
  });
  revalidatePath('/', 'layout');
}

/**
 * Lets mail go to an address again, after the reason it was stopped is fixed.
 * @param email - The address.
 */
export async function allowMail(email: string) {
  const staff = await requireStaff();
  await unsuppress(email);
  // The address itself is a person's detail, so the record only says that an address was allowed.
  await recordStaffAction(db, { actor: staffActor(staff), action: 'mail_allowed' });
  revalidatePath('/', 'layout');
}

/**
 * Saves a report for a case from the findings JSON an analysis produced. The text is checked against the report format and the
 * house language, hashed, and stored as a new version. Staff review it first: this is the last check before it is shown to
 * lawyers.
 * @param caseId - The case id.
 * @param formData - The form with `report` (the JSON).
 * @returns The problems found, or none when saved: `json`, `schema` or `words`.
 */
export async function saveCaseReport(caseId: string, formData: FormData) {
  const user = await requireStaff();
  const raw = formData.get('report');
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

  await saveReport({
    caseId,
    snapshot: parsed.data,
    hash: hashReport(parsed.data),
    savedBy: user.id,
  });
  await recordStaffAction(db, {
    actor: staffActor(user),
    action: 'report_saved',
    target: { type: 'case', id: caseId },
  });
  revalidatePath('/', 'layout');

  return [];
}

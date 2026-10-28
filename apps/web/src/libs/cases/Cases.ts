import { canTakeCase } from '@celia/core';
import type { TakeCaseInput } from '@celia/core';
import { and, count, desc, eq, max, sql } from 'drizzle-orm';
import { recordCaseEvent } from '@/libs/cases/CaseEvents';
import type { Claim } from '@/libs/claims/Claims';
import { db } from '@/libs/DB';
import { notify } from '@/libs/notifications/Notify';
import { claimantIds } from '@/libs/notifications/Recipients';
import {
  caseEventSchema,
  caseReportSchema,
  caseSchema,
  caseTeamSchema,
  claimSchema,
} from '@/models/Schema';
import { isAdmittedFor } from '@/utils/cases/Admission';
import { caseNumber } from '@/utils/cases/Case';
import type { CaseRow } from '@/utils/cases/Case';

/** A case with the platform key that ties it to claims. The key never reaches the browser. */
export type CaseDetail = CaseRow & { platformKey: string };

// When each case's evidence file was sealed. A claim sent after that is not part of the file, so it is not counted with the case.
const sealedEvents = db
  .select({ caseId: caseEventSchema.caseId, at: max(caseEventSchema.createdAt).as('sealed_at') })
  .from(caseEventSchema)
  .where(eq(caseEventSchema.type, 'case_sealed'))
  .groupBy(caseEventSchema.caseId)
  .as('sealed_events');

// Filters a count to the claims in the file: sent before the case was sealed, or the case is not sealed.
const sentInFile = sql`(${sealedEvents.at} is null or ${claimSchema.submittedAt} <= ${sealedEvents.at})`;

const inCase = and(
  eq(claimSchema.platformKey, caseSchema.platformKey),
  eq(claimSchema.status, 'submitted'),
);

// One row per case with its number of claimants (people with a submitted claim against the same platform) and how many of them staff have confirmed.
const caseSelect = {
  id: caseSchema.id,
  seq: caseSchema.seq,
  name: caseSchema.name,
  platformKey: caseSchema.platformKey,
  jurisdiction: caseSchema.jurisdiction,
  description: caseSchema.description,
  status: caseSchema.status,
  updatedAt: caseSchema.updatedAt,
  claimants:
    sql<number>`count(distinct ${claimSchema.userId}) filter (where ${sentInFile})`.mapWith(Number),
  confirmed:
    sql<number>`count(distinct ${claimSchema.userId}) filter (where ${sentInFile} and ${claimSchema.validatedAt} is not null)`.mapWith(
      Number,
    ),
  hasReport: sql<boolean>`exists (select 1 from ${caseReportSchema} where ${caseReportSchema.caseId} = ${caseSchema.id})`,
};

const toRow = (row: {
  id: string;
  seq: number;
  name: string;
  jurisdiction: string;
  description: string | null;
  status: CaseRow['status'];
  updatedAt: Date;
  claimants: number;
  confirmed: number;
  hasReport: boolean;
}): CaseRow => ({
  id: row.id,
  number: caseNumber(row.seq),
  name: row.name,
  jurisdiction: row.jurisdiction,
  description: row.description,
  status: row.status,
  claimants: row.claimants,
  confirmed: row.confirmed,
  hasReport: row.hasReport,
  updatedAt: row.updatedAt.toISOString(),
});

const toDetail = (row: Parameters<typeof toRow>[0] & { platformKey: string }): CaseDetail => ({
  ...toRow(row),
  platformKey: row.platformKey,
});

/**
 * Lists every case for the case bank, most recently changed first. Only the summary: nobody's claim is in it.
 * @returns The cases.
 */
export async function listCases() {
  const rows = await db
    .select(caseSelect)
    .from(caseSchema)
    .leftJoin(sealedEvents, eq(sealedEvents.caseId, caseSchema.id))
    .leftJoin(claimSchema, inCase)
    .groupBy(caseSchema.id, sealedEvents.at)
    .orderBy(desc(caseSchema.updatedAt));

  return rows.map(toRow);
}

/**
 * Reads one case.
 * @param id - The case id.
 * @returns The case, or undefined.
 */
export async function getCase(id: string) {
  const [row] = await db
    .select(caseSelect)
    .from(caseSchema)
    .leftJoin(sealedEvents, eq(sealedEvents.caseId, caseSchema.id))
    .leftJoin(claimSchema, inCase)
    .where(eq(caseSchema.id, id))
    .groupBy(caseSchema.id, sealedEvents.at);

  return row ? toDetail(row) : undefined;
}

/**
 * Whether a lawyer leads a case.
 * @param caseId - The case id.
 * @param userId - The Clerk user id of the lawyer.
 * @returns True when they lead it.
 */
export async function leadsCase(caseId: string, userId: string) {
  const [row] = await db
    .select({ id: caseTeamSchema.id })
    .from(caseTeamSchema)
    .where(
      and(
        eq(caseTeamSchema.caseId, caseId),
        eq(caseTeamSchema.userId, userId),
        eq(caseTeamSchema.role, 'lead'),
      ),
    );

  return row !== undefined;
}

/**
 * Gathers what `canTakeCase` needs to know about a lawyer and a case.
 * @param options - The question.
 * @param options.userId - The Clerk user id of the lawyer.
 * @param options.verified - Whether staff have verified them.
 * @param options.admittedIn - The jurisdiction ids they are admitted in.
 * @param options.found - The case.
 * @param options.conflictsConfirmed - Whether they confirmed their firm checked conflicts.
 * @returns The input for `canTakeCase`.
 */
async function takeCaseInput(options: {
  userId: string;
  verified: boolean;
  admittedIn: string[];
  found: CaseDetail;
  conflictsConfirmed: boolean;
}): Promise<TakeCaseInput> {
  const [lead, open, claims] = await Promise.all([
    db
      .select({ id: caseTeamSchema.id })
      .from(caseTeamSchema)
      .where(and(eq(caseTeamSchema.caseId, options.found.id), eq(caseTeamSchema.role, 'lead'))),
    db
      .select({ total: count() })
      .from(caseTeamSchema)
      .where(eq(caseTeamSchema.userId, options.userId)),
    db
      .select({ id: claimSchema.id })
      .from(claimSchema)
      .where(
        and(
          eq(claimSchema.userId, options.userId),
          eq(claimSchema.platformKey, options.found.platformKey),
        ),
      ),
  ]);

  return {
    verified: options.verified,
    caseSealed: options.found.status === 'sealed',
    caseHasLead: lead.length > 0,
    admittedInJurisdiction: isAdmittedFor(options.admittedIn, options.found.jurisdiction),
    isClaimant: claims.length > 0,
    conflictsConfirmed: options.conflictsConfirmed,
    openCases: open[0]?.total ?? 0,
  };
}

/**
 * Decides whether a lawyer's firm can take a case now.
 * @param options - See `takeCaseInput`.
 * @returns `ok`, or the first reason it cannot.
 */
export async function evaluateTake(options: Parameters<typeof takeCaseInput>[0]) {
  return canTakeCase(await takeCaseInput(options));
}

/**
 * Makes a lawyer the lead of a case and marks the case as with counsel, in one step. The unique index on the lead row means
 * that when two lawyers take a case at the same moment, only one of them gets it.
 * @param options - Who takes which case.
 * @param options.caseId - The case id.
 * @param options.userId - The Clerk user id of the lawyer.
 * @returns True when they got the case, false when someone else already had it.
 */
export async function takeCase(options: { caseId: string; userId: string }) {
  return await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(caseTeamSchema)
      .values({
        caseId: options.caseId,
        userId: options.userId,
        role: 'lead',
        conflictsConfirmedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning({ id: caseTeamSchema.id });

    if (inserted.length === 0) {
      return false;
    }

    const [taken] = await tx
      .update(caseSchema)
      .set({ status: 'counsel' })
      .where(eq(caseSchema.id, options.caseId))
      .returning({ platformKey: caseSchema.platformKey });

    await recordCaseEvent(tx, options.caseId, 'case_taken');

    // Claimants are told a firm has taken the case, never which one; the firm's lead lawyer gets a confirmation.
    const claimants = taken ? await claimantIds(tx, taken.platformKey) : [];
    await notify(tx, [
      ...claimants.map((userId) => ({
        userId,
        type: 'case_taken' as const,
        dedupeKey: `case_taken:${options.caseId}`,
        data: { caseId: options.caseId },
      })),
      {
        userId: options.userId,
        type: 'case_taken_by_you' as const,
        dedupeKey: `case_taken_by_you:${options.caseId}`,
        data: { caseId: options.caseId },
      },
    ]);

    return true;
  });
}

/**
 * Whether a claim was sent after the evidence file of its case was sealed, so it is not in that file.
 * @param claim - The claim.
 * @returns True when the case was sealed before the claim was sent.
 */
export async function sentAfterSeal(claim: Pick<Claim, 'platformKey' | 'submittedAt'>) {
  if (!claim.platformKey || !claim.submittedAt) {
    return false;
  }

  const [row] = await db
    .select({ sealedAt: max(caseEventSchema.createdAt) })
    .from(caseEventSchema)
    .innerJoin(caseSchema, eq(caseSchema.id, caseEventSchema.caseId))
    .where(
      and(eq(caseSchema.platformKey, claim.platformKey), eq(caseEventSchema.type, 'case_sealed')),
    );

  return row?.sealedAt !== null && row?.sealedAt !== undefined && row.sealedAt < claim.submittedAt;
}

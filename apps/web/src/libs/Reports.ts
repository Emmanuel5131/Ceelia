import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { caseReportSchema } from '@/models/Schema';
import type { Report } from '@/validations/ReportValidation';

/** A saved report as the app shows it. */
export type ReportView = {
  version: number;
  snapshot: Report;
  /** SHA-256 of the snapshot, as `0x` and 64 hex characters. */
  hash: string;
  notebookUrl: string | null;
  /** ISO time it was saved. */
  savedAt: string;
};

/**
 * The newest report for a case.
 * @param caseId - The case id.
 * @returns The report, or null when none has been saved.
 */
export async function getLatestReport(caseId: string): Promise<ReportView | null> {
  const [row] = await db
    .select()
    .from(caseReportSchema)
    .where(eq(caseReportSchema.caseId, caseId))
    .orderBy(desc(caseReportSchema.version))
    .limit(1);

  return row
    ? {
        version: row.version,
        snapshot: row.snapshot,
        hash: row.hash,
        notebookUrl: row.notebookUrl,
        savedAt: row.createdAt.toISOString(),
      }
    : null;
}

/**
 * Saves a new version of a case's report. Earlier versions are kept, never edited: the newest is shown, and the older ones
 * remain as the record of what was said before.
 * @param options - What to save.
 * @param options.caseId - The case id.
 * @param options.snapshot - The checked findings.
 * @param options.hash - The snapshot's hash.
 * @param options.notebookUrl - A link to the method notebook, or null.
 * @param options.savedBy - The Clerk user id of the staff member.
 */
export async function saveReport(options: {
  caseId: string;
  snapshot: Report;
  hash: string;
  notebookUrl: string | null;
  savedBy: string;
}) {
  await db.insert(caseReportSchema).values({
    caseId: options.caseId,
    // The next number is worked out in the same statement; the unique index stops two saves taking the same one.
    version: sql`(select coalesce(max(${caseReportSchema.version}), 0) + 1 from ${caseReportSchema} where ${caseReportSchema.caseId} = ${options.caseId})`,
    snapshot: options.snapshot,
    hash: options.hash,
    notebookUrl: options.notebookUrl,
    savedBy: options.savedBy,
  });
}

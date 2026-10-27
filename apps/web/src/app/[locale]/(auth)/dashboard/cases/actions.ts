'use server';

import { auth } from '@clerk/nextjs/server';
import * as z from 'zod';
import { reportedPattern } from '@/libs/CaseClaims';
import { getReport } from '@/libs/Reports';

/**
 * Loads what the preview shows for a case: its newest report and the kind of loss most claimants report. Any signed-in person may
 * read it: the report holds public facts only, and the pattern is a count with no one's detail. A visitor who is not signed in
 * gets nothing.
 * @param caseId - The case id.
 * @returns The report (or null) and the pattern (or null), or null when the caller is not signed in.
 */
export async function loadCasePreview(caseId: string) {
  const { userId } = await auth();

  if (!userId || !z.uuid().safeParse(caseId).success) {
    return null;
  }

  const [report, reported] = await Promise.all([getReport(caseId), reportedPattern(caseId)]);

  return { report, reported };
}

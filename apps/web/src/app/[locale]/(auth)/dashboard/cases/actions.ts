'use server';

import { auth } from '@clerk/nextjs/server';
import * as z from 'zod';
import { getLatestReport } from '@/libs/Reports';

/**
 * Loads a case's newest report for the preview. Any signed-in person may read it: it holds public facts only (what the chain
 * shows, counts, the method), never a claimant's detail. A visitor who is not signed in gets nothing.
 * @param caseId - The case id.
 * @returns The report, or null when there is none or the caller is not signed in.
 */
export async function loadCaseReport(caseId: string) {
  const { userId } = await auth();

  if (!userId || !z.uuid().safeParse(caseId).success) {
    return null;
  }

  return await getLatestReport(caseId);
}

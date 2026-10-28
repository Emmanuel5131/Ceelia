import type { Executor } from '@/libs/notifications/Notify';
import type { CaseEventType } from '@/models/Schema';
import { caseEventSchema } from '@/models/Schema';

/**
 * Records that something happened to a case. Call it in the same transaction as the change, so the activity feed never shows
 * an event that rolled back.
 * @param executor - The database or a transaction.
 * @param caseId - The case id.
 * @param type - What happened.
 * @param count - How many things it covers; one by default.
 */
export async function recordCaseEvent(
  executor: Executor,
  caseId: string,
  type: CaseEventType,
  count = 1,
) {
  await executor.insert(caseEventSchema).values({ caseId, type, count });
}

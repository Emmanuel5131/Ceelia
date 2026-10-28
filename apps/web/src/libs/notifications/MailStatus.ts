import { count, desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { emailMessageSchema, emailSuppressionSchema } from '@/models/Schema';

export type FailedMail = {
  id: string;
  type: string;
  attempts: number;
  lastError: string;
  createdAt: string;
};

export type SuppressedAddress = { email: string; reason: string; createdAt: string };

/**
 * What staff need to see about mail: how many messages wait or are being sent, the latest failures with their errors, and the
 * addresses we have stopped mailing.
 * @returns The queue counts, the failures and the suppressed addresses.
 */
export async function mailStatus() {
  const [queue, failed, suppressed] = await Promise.all([
    db
      .select({ status: emailMessageSchema.status, total: count() })
      .from(emailMessageSchema)
      .groupBy(emailMessageSchema.status),
    db
      .select()
      .from(emailMessageSchema)
      .where(eq(emailMessageSchema.status, 'failed'))
      .orderBy(desc(emailMessageSchema.createdAt))
      .limit(20),
    db
      .select()
      .from(emailSuppressionSchema)
      .orderBy(desc(emailSuppressionSchema.createdAt))
      .limit(50),
  ]);
  const totals = new Map(queue.map((row) => [row.status, row.total]));

  return {
    pending: totals.get('pending') ?? 0,
    sending: totals.get('sending') ?? 0,
    failed: totals.get('failed') ?? 0,
    failures: failed.map((row): FailedMail => ({
      id: row.id,
      type: row.type,
      attempts: row.attempts,
      lastError: row.lastError ?? '',
      createdAt: row.createdAt.toISOString(),
    })),
    suppressed: suppressed.map((row): SuppressedAddress => ({
      email: row.email,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

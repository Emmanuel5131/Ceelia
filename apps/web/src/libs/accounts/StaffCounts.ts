import { and, count, eq, isNotNull, isNull } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { emailMessageSchema, claimSchema, institutionApplicationSchema } from '@/models/Schema';

/**
 * How much is waiting in each staff queue, for the numbers in the staff menu and on the overview. The true totals, even when a
 * queue page loads only its oldest rows.
 * @returns The counts.
 */
export async function staffCounts() {
  const [[applications], [wallets], [claims], [mail]] = await Promise.all([
    db
      .select({ total: count() })
      .from(institutionApplicationSchema)
      .where(eq(institutionApplicationSchema.status, 'in_review')),
    db
      .select({ total: count() })
      .from(claimSchema)
      .where(and(isNotNull(claimSchema.reviewRequestedAt), isNull(claimSchema.reviewedAt))),
    db
      .select({ total: count() })
      .from(claimSchema)
      .where(and(eq(claimSchema.status, 'submitted'), isNull(claimSchema.validatedAt))),
    db
      .select({ total: count() })
      .from(emailMessageSchema)
      .where(eq(emailMessageSchema.status, 'failed')),
  ]);

  return {
    applications: applications?.total ?? 0,
    wallets: wallets?.total ?? 0,
    claims: claims?.total ?? 0,
    mail: mail?.total ?? 0,
  };
}

export type StaffCounts = Awaited<ReturnType<typeof staffCounts>>;

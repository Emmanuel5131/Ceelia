import {
  classifyFailure,
  dailyLimit,
  nextAttemptAt,
  notificationCatalog,
  optionalCategories,
  toMailError,
} from '@celia/core';
import { clerkClient } from '@clerk/nextjs/server';
import { and, asc, count, eq, gte, inArray, lt, lte, or, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { renderNotification } from '@/libs/EmailRender';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { sendMail, senderDomain } from '@/libs/Mailer';
import { emailMessageSchema, emailSuppressionSchema, notificationSchema } from '@/models/Schema';
import { getBaseUrl } from '@/utils/Helpers';
import { signUnsubscribe } from '@/utils/Unsubscribe';

type Claimed = typeof emailMessageSchema.$inferSelect;
type Outcome = 'sent' | 'retried' | 'failed' | 'suppressed';

export type DrainResult = {
  claimed: number;
  sent: number;
  retried: number;
  failed: number;
  suppressed: number;
  /** How many more emails today's limit allows after this run. */
  budgetLeft: number;
};

// A worker that died while holding a row leaves it in `sending`; after this long the row is released to be tried again.
const staleAfterMs = 5 * 60 * 1000;
const retentionMs = 90 * 24 * 60 * 60 * 1000;
const concurrency = 4;

const messageIdFor = (id: string) => `<${id}@${senderDomain()}>`;
const startOfDay = (now: Date) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

/**
 * How many more emails may go out today. The limit is the warm-up ramp while a new address builds a reputation, then the
 * daily ceiling. Messages already sent today and messages being sent right now both count, so two workers at once cannot
 * overshoot it.
 * @param now - The current time.
 * @returns The number still allowed, never negative.
 */
async function budget(now: Date) {
  const ceiling = Env.MAIL_DAILY_LIMIT;
  const limit = Env.MAIL_WARMUP_START
    ? dailyLimit(new Date(Env.MAIL_WARMUP_START), now, ceiling)
    : ceiling;
  const [row] = await db
    .select({ used: count() })
    .from(emailMessageSchema)
    .where(
      or(
        eq(emailMessageSchema.status, 'sending'),
        and(eq(emailMessageSchema.status, 'sent'), gte(emailMessageSchema.sentAt, startOfDay(now))),
      ),
    );

  return Math.max(0, limit - (row?.used ?? 0));
}

/**
 * Takes up to `take` due messages for this worker. `FOR UPDATE SKIP LOCKED` lets several workers claim at once without ever
 * taking the same row, and the status change to `sending` keeps it ours after the claim transaction ends.
 * @param take - How many to claim.
 * @param now - The current time.
 * @returns The claimed rows, with their attempt count already raised.
 */
function claim(take: number, now: Date) {
  return db
    .update(emailMessageSchema)
    .set({
      status: 'sending',
      lockedAt: now,
      attempts: sql`${emailMessageSchema.attempts} + 1`,
    })
    .where(
      inArray(
        emailMessageSchema.id,
        db
          .select({ id: emailMessageSchema.id })
          .from(emailMessageSchema)
          .where(
            and(
              eq(emailMessageSchema.status, 'pending'),
              lte(emailMessageSchema.nextAttemptAt, now),
            ),
          )
          .orderBy(asc(emailMessageSchema.nextAttemptAt))
          .limit(take)
          .for('update', { skipLocked: true }),
      ),
    )
    .returning();
}

const finish = (row: Claimed, values: Partial<typeof emailMessageSchema.$inferInsert>) =>
  db
    .update(emailMessageSchema)
    .set({ lockedAt: null, ...values })
    .where(eq(emailMessageSchema.id, row.id));

/**
 * Records a send that did not work: tries again later, or gives up. A permanent refusal stops the message; an address that
 * does not exist also joins the suppression list so nothing mails it again.
 * @param row - The message.
 * @param error - What went wrong.
 * @param now - The current time.
 * @param address - The address, when known.
 * @returns What happened to the message.
 */
async function recordFailure(
  row: Claimed,
  error: unknown,
  now: Date,
  address?: string,
): Promise<Outcome> {
  const kind = classifyFailure(toMailError(error));
  const lastError = (error instanceof Error ? error.message : String(error)).slice(0, 500);
  const next = kind === 'retry' ? nextAttemptAt(row.attempts, now) : null;

  if (next) {
    await finish(row, { status: 'pending', nextAttemptAt: next, lastError });

    return 'retried';
  }

  if (kind === 'bounce' && address) {
    await db
      .insert(emailSuppressionSchema)
      .values({ email: address.toLowerCase(), reason: 'bounce' })
      .onConflictDoNothing();
  }

  await finish(row, { status: 'failed', lastError });

  return 'failed';
}

/**
 * Sends one claimed message: finds the person's current address in Clerk, skips suppressed addresses, writes the email in the
 * person's language and hands it to the mail server. Nothing is stored about the address except after a successful send.
 * @param row - The claimed message.
 * @param now - The current time.
 * @returns What happened to it.
 */
async function deliver(row: Claimed, now: Date): Promise<Outcome> {
  const clerk = await clerkClient();
  const { data: users } = await clerk.users.getUserList({ userId: [row.userId] });
  const address = users[0]?.primaryEmailAddress?.emailAddress.toLowerCase();

  if (!address) {
    await finish(row, { status: 'failed', lastError: 'no email address' });

    return 'failed';
  }

  const [suppressed] = await db
    .select({ email: emailSuppressionSchema.email })
    .from(emailSuppressionSchema)
    .where(eq(emailSuppressionSchema.email, address));

  if (suppressed) {
    await finish(row, { status: 'suppressed' });

    return 'suppressed';
  }

  const [notification] = await db
    .select({ data: notificationSchema.data })
    .from(notificationSchema)
    .where(eq(notificationSchema.id, row.notificationId));

  const entry = notificationCatalog[row.type];
  const category = optionalCategories.find((value) => value === entry.category);
  const unsubscribeUrl =
    !entry.essential && category && Env.UNSUBSCRIBE_SECRET
      ? `${getBaseUrl()}/api/unsubscribe?token=${signUnsubscribe(Env.UNSUBSCRIBE_SECRET, { userId: row.userId, category })}`
      : undefined;

  const email = await renderNotification({
    type: row.type,
    locale: row.locale,
    data: notification?.data ?? {},
    unsubscribeUrl,
  });

  await sendMail({ to: address, ...email, messageId: messageIdFor(row.id), unsubscribeUrl });
  await finish(row, { status: 'sent', sentAt: now, sentTo: address, lastError: null });

  return 'sent';
}

/**
 * Sends the emails that are due. Run it on a schedule. It releases messages a dead worker left behind, respects the daily
 * limit, claims a batch, sends each message (a few at a time) and records the result, then deletes records older than 90 days.
 * A failure on one message never stops the others.
 * @param options - The run options.
 * @param options.limit - The most messages to send in this run.
 * @returns Counts of what happened.
 */
export async function drain(options: { limit: number }): Promise<DrainResult> {
  const now = new Date();

  await db
    .update(emailMessageSchema)
    .set({ status: 'pending', lockedAt: null })
    .where(
      and(
        eq(emailMessageSchema.status, 'sending'),
        lt(emailMessageSchema.lockedAt, new Date(now.getTime() - staleAfterMs)),
      ),
    );

  const allowed = await budget(now);
  const rows = await claim(Math.min(options.limit, allowed), now);
  const result: DrainResult = {
    claimed: rows.length,
    sent: 0,
    retried: 0,
    failed: 0,
    suppressed: 0,
    budgetLeft: allowed - rows.length,
  };

  for (let start = 0; start < rows.length; start += concurrency) {
    // Batches go one after another on purpose: a few at a time keeps the number of open connections and Clerk requests small.
    // oxlint-disable-next-line eslint/no-await-in-loop
    const outcomes = await Promise.all(
      rows.slice(start, start + concurrency).map(async (row) => {
        try {
          return await deliver(row, now);
        } catch (error) {
          logger.error(
            `Email ${row.id} failed: ${error instanceof Error ? error.message : String(error)}`,
          );

          return await recordFailure(row, error, now);
        }
      }),
    );

    for (const outcome of outcomes) {
      result[outcome] += 1;
    }
  }

  await db
    .delete(emailMessageSchema)
    .where(
      and(
        inArray(emailMessageSchema.status, ['sent', 'failed', 'suppressed', 'cancelled']),
        lt(emailMessageSchema.createdAt, new Date(now.getTime() - retentionMs)),
      ),
    );

  return result;
}

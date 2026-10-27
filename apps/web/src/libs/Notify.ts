import { and, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/libs/DB';
import {
  emailMessageSchema,
  notificationPreferenceSchema,
  notificationSchema,
  userSettingSchema,
} from '@/models/Schema';
import { planNotifications } from '@/utils/NotifyPlan';
import type { NotifyEvent } from '@/utils/NotifyPlan';

/** The database, or a transaction on it. Pass a transaction so the notification commits with the change that caused it. */
export type Executor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Records what happened to people: a notification in the app for each, and an email in the outbox for those who should get
 * one. Call it with the same transaction as the change, so a notification is never lost and never exists for a change that
 * rolled back. The email is sent later by the worker. Running it twice for the same event writes nothing the second time.
 * @param executor - The database or a transaction.
 * @param events - What happened, one per person.
 */
export async function notify(executor: Executor, events: NotifyEvent[]) {
  if (events.length === 0) {
    return;
  }

  const userIds = [...new Set(events.map((event) => event.userId))];
  const [preferences, settings] = await Promise.all([
    executor
      .select()
      .from(notificationPreferenceSchema)
      .where(inArray(notificationPreferenceSchema.userId, userIds)),
    executor.select().from(userSettingSchema).where(inArray(userSettingSchema.userId, userIds)),
  ]);

  const emailChoices = new Map<string, Record<string, boolean>>();

  for (const row of preferences) {
    emailChoices.set(row.userId, { ...emailChoices.get(row.userId), [row.category]: row.email });
  }

  const plans = planNotifications(events, {
    preferences: emailChoices,
    locales: new Map(settings.map((row) => [row.userId, row.locale])),
  });

  // Only rows that were new come back, so an event that already happened sends nothing again.
  const inserted = await executor
    .insert(notificationSchema)
    .values(
      plans.map(({ event }) => ({
        userId: event.userId,
        type: event.type,
        dedupeKey: event.dedupeKey,
        data: event.data ?? {},
      })),
    )
    .onConflictDoNothing()
    .returning({
      id: notificationSchema.id,
      userId: notificationSchema.userId,
      dedupeKey: notificationSchema.dedupeKey,
    });

  const created = new Map(inserted.map((row) => [`${row.userId}:${row.dedupeKey}`, row.id]));
  const emails = plans.flatMap((plan) => {
    const notificationId = created.get(`${plan.event.userId}:${plan.event.dedupeKey}`);

    return plan.email && notificationId
      ? [
          {
            notificationId,
            userId: plan.event.userId,
            type: plan.event.type,
            locale: plan.locale,
          },
        ]
      : [];
  });

  if (emails.length > 0) {
    await executor.insert(emailMessageSchema).values(emails);
  }
}

/**
 * Marks a person's notifications as read.
 * @param userId - The Clerk user id.
 * @param ids - The notifications to mark, or all of theirs when omitted.
 */
export async function markRead(userId: string, ids?: string[]) {
  await db
    .update(notificationSchema)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notificationSchema.userId, userId),
        isNull(notificationSchema.readAt),
        ids ? inArray(notificationSchema.id, ids) : undefined,
      ),
    );
}

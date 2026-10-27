import type { NotificationType } from '@celia/core';
import { count, desc, eq, and, isNull } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { notificationSchema } from '@/models/Schema';

/** One notification as the app shows it. */
export type InboxItem = {
  id: string;
  type: NotificationType;
  data: Record<string, string>;
  read: boolean;
  /** ISO timestamp. */
  createdAt: string;
};

/**
 * A person's notifications, newest first.
 * @param userId - The Clerk user id.
 * @param limit - The most to return.
 * @returns The notifications.
 */
export async function listInbox(userId: string, limit: number): Promise<InboxItem[]> {
  const rows = await db
    .select()
    .from(notificationSchema)
    .where(eq(notificationSchema.userId, userId))
    .orderBy(desc(notificationSchema.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    data: row.data,
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  }));
}

/**
 * How many notifications a person has not read.
 * @param userId - The Clerk user id.
 * @returns The count.
 */
export async function countUnread(userId: string) {
  const [row] = await db
    .select({ total: count() })
    .from(notificationSchema)
    .where(and(eq(notificationSchema.userId, userId), isNull(notificationSchema.readAt)));

  return row?.total ?? 0;
}

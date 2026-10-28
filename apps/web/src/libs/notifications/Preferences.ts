import type { EmailPreferences, OptionalCategory } from '@celia/core';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { notificationPreferenceSchema } from '@/models/Schema';

/**
 * Reads which optional categories of email a person has turned on or off. A category they never touched is not in the result,
 * which means on.
 * @param userId - The Clerk user id.
 * @returns Their email choices.
 */
export async function getEmailPreferences(userId: string) {
  const rows = await db
    .select()
    .from(notificationPreferenceSchema)
    .where(eq(notificationPreferenceSchema.userId, userId));

  return Object.fromEntries(rows.map((row) => [row.category, row.email])) as EmailPreferences;
}

/**
 * Turns a category of email on or off for a person. Account notices have no category here: they cannot be turned off.
 * @param userId - The Clerk user id.
 * @param category - `claims` or `cases`.
 * @param email - Whether to send that category by email.
 */
export async function setEmailPreference(
  userId: string,
  category: OptionalCategory,
  email: boolean,
) {
  await db
    .insert(notificationPreferenceSchema)
    .values({ userId, category, email })
    .onConflictDoUpdate({
      target: [notificationPreferenceSchema.userId, notificationPreferenceSchema.category],
      set: { email },
    });
}

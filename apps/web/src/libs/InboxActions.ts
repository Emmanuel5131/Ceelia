'use server';

import { optionalCategories } from '@celia/core';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { markRead } from '@/libs/Notify';
import { setEmailPreference } from '@/libs/Preferences';
import { saveLocale } from '@/libs/UserSettings';

/**
 * Marks all of the signed-in person's notifications as read.
 */
export async function markAllRead() {
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  await markRead(userId);
  revalidatePath('/', 'layout');
}

/**
 * Turns a category of email on or off for the signed-in person. A category that cannot be turned off is ignored.
 * @param category - The category name.
 * @param email - Whether to send it by email.
 */
export async function updateEmailPreference(category: string, email: boolean) {
  const { userId } = await auth();
  const known = optionalCategories.find((value) => value === category);

  if (!userId || !known) {
    return;
  }

  await setEmailPreference(userId, known, email);
  revalidatePath('/', 'layout');
}

/**
 * Remembers the language the signed-in person just chose, so later emails are written in it. Does nothing for a visitor.
 * @param locale - The language.
 */
export async function rememberLocale(locale: string) {
  const { userId } = await auth();

  if (userId) {
    await saveLocale(userId, locale);
  }
}

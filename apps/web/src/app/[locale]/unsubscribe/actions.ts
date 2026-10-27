'use server';

import { Env } from '@/libs/Env';
import { setEmailPreference } from '@/libs/Preferences';
import { verifyUnsubscribe } from '@/utils/Unsubscribe';

/**
 * Turns a category of email off, from the confirmation page. The token is checked again here: a page is not a permission.
 * @param token - The token from the link.
 * @returns True when the category was turned off.
 */
export async function confirmUnsubscribe(token: string) {
  const claim = Env.UNSUBSCRIBE_SECRET ? verifyUnsubscribe(Env.UNSUBSCRIBE_SECRET, token) : null;

  if (!claim) {
    return false;
  }

  await setEmailPreference(claim.userId, claim.category, false);

  return true;
}

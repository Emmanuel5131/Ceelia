'use server';

import type { TakeCaseRefusal } from '@celia/core';
import { currentUser } from '@clerk/nextjs/server';
import { getLocale } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as z from 'zod';
import { evaluateTake, getCase, takeCase } from '@/libs/cases/Cases';
import { saveLocale } from '@/libs/notifications/UserSettings';
import { parseAccount } from '@/utils/accounts/Account';
import { parseProfile } from '@/utils/accounts/Profile';
import { getI18nPath } from '@/utils/Helpers';

export type TakeCaseState = {
  /** Why the case could not be taken, or null when it was. */
  reason: TakeCaseRefusal | null;
};

/**
 * Takes a case for the signed-in lawyer's firm. The server decides: it re-reads the lawyer's review status and open cases itself and trusts nothing in the form except the lawyer's confirmation that their firm checked conflicts.
 * @param caseId - The case id.
 * @param formData - The submitted form, with the `conflicts` confirmation.
 * @returns The reason the case could not be taken, or null.
 */
export async function takeCaseAction(caseId: string, formData: FormData): Promise<TakeCaseState> {
  const user = await currentUser();
  const account = parseAccount(user?.publicMetadata);

  if (!user || account?.accountType !== 'counsel') {
    return redirect(getI18nPath('/dashboard', await getLocale()));
  }

  const found = z.uuid().safeParse(caseId).success ? await getCase(caseId) : undefined;
  const profile = parseProfile('counsel', user.privateMetadata);

  if (!found || profile?.accountType !== 'counsel') {
    return { reason: 'not_verified' };
  }

  await saveLocale(user.id, await getLocale());
  const decision = await evaluateTake({
    userId: user.id,
    verified: account.review === 'verified',
    found,
    conflictsConfirmed: formData.get('conflicts') === 'on',
  });

  if (!decision.ok) {
    return { reason: decision.reason };
  }

  if (!(await takeCase({ caseId, userId: user.id }))) {
    return { reason: 'already_taken' };
  }

  revalidatePath('/', 'layout');

  return { reason: null };
}

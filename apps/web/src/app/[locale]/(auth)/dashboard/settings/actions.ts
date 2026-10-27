'use server';

import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { getLocale } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { saveCounselProfile } from '@/libs/CounselProfile';
import { db } from '@/libs/DB';
import { notify } from '@/libs/Notify';
import { saveLocale } from '@/libs/UserSettings';
import { parseAccount } from '@/utils/Account';
import { getI18nPath } from '@/utils/Helpers';
import { parseProfile } from '@/utils/Profile';
import {
  CounselProfileValidation,
  PersonProfileValidation,
} from '@/validations/OnboardingValidation';

export type ProfileState = {
  /** The names of the fields that failed, so the form can mark them. */
  errors: string[];
};

const text = (formData: FormData, name: string) => formData.get(name) ?? undefined;

const failed = (issues: { path: PropertyKey[] }[]): ProfileState => ({
  errors: [...new Set(issues.map((issue) => String(issue.path[0])))],
});

/**
 * Saves the details a person gave in onboarding. The account type comes from the server, never from the form, and is never
 * changed here. A verified lawyer who changes where they are admitted goes back to `pending`, so staff check the new
 * jurisdictions before claimant details stay visible.
 * @param formData - The submitted form.
 * @returns The failed fields; on success, none.
 */
export async function updateProfile(formData: FormData): Promise<ProfileState> {
  const locale = await getLocale();
  const { userId } = await auth();

  if (!userId) {
    return redirect(getI18nPath('/sign-in', locale));
  }

  const user = await currentUser();
  const account = parseAccount(user?.publicMetadata);

  if (!user || !account) {
    return redirect(getI18nPath('/onboarding', locale));
  }

  const client = await clerkClient();

  if (account.accountType === 'person') {
    const parsed = PersonProfileValidation.safeParse({ country: text(formData, 'country') });

    if (!parsed.success) {
      return failed(parsed.error.issues);
    }

    await client.users.updateUserMetadata(userId, {
      privateMetadata: { country: parsed.data.country },
    });
  } else {
    const parsed = CounselProfileValidation.safeParse({
      independent: text(formData, 'independent'),
      firmName: text(formData, 'firmName'),
      registrations: formData
        .getAll('registrationJurisdiction')
        .map((jurisdiction) => ({ jurisdiction })),
    });

    if (!parsed.success) {
      return failed(parsed.error.issues);
    }

    const before = parseProfile('counsel', user.privateMetadata);
    const previous = new Set(before?.accountType === 'counsel' ? before.jurisdictions : []);
    const next = new Set(
      parsed.data.registrations.map((registration) => registration.jurisdiction),
    );
    const sameJurisdictions =
      previous.size === next.size && [...next].every((id) => previous.has(id));

    const reset = account.review === 'verified' && !sameJurisdictions;
    const firm = parsed.data.independent === 'on' ? null : (parsed.data.firmName ?? null);

    await client.users.updateUserMetadata(userId, {
      privateMetadata: { firm, registrations: parsed.data.registrations },
      ...(reset ? { publicMetadata: { review: 'pending' } } : {}),
    });
    await db.transaction(async (tx) => {
      await saveCounselProfile(tx, {
        userId,
        review: reset || account.review !== 'verified' ? 'pending' : 'verified',
        firm,
        jurisdictions: [...next],
      });

      if (reset) {
        await notify(tx, [
          {
            userId,
            type: 'counsel_review_reset',
            // A lawyer can be sent back more than once, so the key carries the minute.
            dedupeKey: `counsel_review_reset:${new Date().toISOString().slice(0, 16)}`,
          },
        ]);
      }
    });
  }

  await saveLocale(userId, locale);

  revalidatePath('/', 'layout');

  return { errors: [] };
}

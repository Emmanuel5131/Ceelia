'use server';

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { getLocale } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { blankToNull, readApplicationFields } from '@/libs/accounts/ApplicationForm';
import { getApplication } from '@/libs/accounts/Applications';
import {
  reopenApplication,
  saveApplicationDetails,
  saveCounselProfile,
} from '@/libs/accounts/CounselProfile';
import { db } from '@/libs/DB';
import { notify } from '@/libs/notifications/Notify';
import { parseAccount } from '@/utils/accounts/Account';
import { getI18nPath } from '@/utils/Helpers';
import { ApplicationValidation } from '@/validations/OnboardingValidation';

export type ReapplyState = {
  /** The names of the fields that failed, so the form can mark them. */
  errors: string[];
};

/** The version of the wording a person agreed to, kept with the terms they accept again. */
const consentVersion = '2026-10';

/**
 * Sends a rejected applicant's new application. It only works for a counsel account that is still waiting, whose application was
 * rejected, and once the waiting period has passed. It replaces the details, clears the old decision and starts a new review.
 * @param _state - The previous form state (unused).
 * @param formData - The submitted form.
 * @returns The failed fields; on success it redirects to the dashboard instead.
 */
export async function reapply(_state: ReapplyState, formData: FormData): Promise<ReapplyState> {
  const locale = await getLocale();
  const dashboard = getI18nPath('/dashboard', locale);
  const user = await currentUser();
  const account = parseAccount(user?.publicMetadata);

  if (!user || account?.accountType !== 'counsel' || account.review !== 'pending') {
    return redirect(dashboard);
  }

  const application = await getApplication(user.id);

  if (!application?.canReapply) {
    return redirect(dashboard);
  }

  const parsed = ApplicationValidation.safeParse({
    accountType: 'counsel',
    ...readApplicationFields(formData),
  });

  if (!parsed.success) {
    return { errors: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))] };
  }

  const input = parsed.data;
  const firm = input.independent === 'on' ? null : (input.firmName ?? null);
  const client = await clerkClient();

  await client.users.updateUserMetadata(user.id, {
    privateMetadata: {
      firm,
      registrations: input.registrations,
      kind: input.kind,
      registrationNumber: input.registrationNumber,
      terms: { version: consentVersion, at: new Date().toISOString() },
    },
  });
  await db.transaction(async (tx) => {
    await saveCounselProfile(tx, {
      userId: user.id,
      review: 'pending',
      kind: input.kind,
      firm,
      jurisdictions: input.registrations.map((registration) => registration.jurisdiction),
    });
    await saveApplicationDetails(tx, {
      userId: user.id,
      kind: input.kind,
      organisation: firm,
      registrationNumber: input.registrationNumber,
      website: blankToNull(input.website),
      contactRole: blankToNull(input.contactRole),
    });
    await reopenApplication(tx, user.id);
    await notify(tx, [
      {
        userId: user.id,
        type: 'counsel_received',
        // An applicant can apply more than once, so the key carries the minute.
        dedupeKey: `counsel_received:${new Date().toISOString().slice(0, 16)}`,
      },
    ]);
  });
  revalidatePath('/', 'layout');

  return redirect(dashboard);
}

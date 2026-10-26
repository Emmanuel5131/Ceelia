'use server';

import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { parseAccount } from '@/utils/Account';
import { getI18nPath } from '@/utils/Helpers';
import { OnboardingValidation } from '@/validations/OnboardingValidation';

export type OnboardingState = {
  /** The names of the fields that failed, so the form can mark them. */
  errors: string[];
};

/** The version of the wording a person agreed to, kept with the consent so we can show what they accepted. */
const consentVersion = '2026-10';

const text = (formData: FormData, name: string) => formData.get(name) ?? undefined;

/**
 * Reads the form into the shape the validation expects. Registrations arrive as two parallel lists, one entry per row.
 * @param formData - The submitted form.
 * @returns The raw input, not yet validated.
 */
function readForm(formData: FormData) {
  const jurisdictions = formData.getAll('registrationJurisdiction');
  const numbers = formData.getAll('registrationNumber');

  return {
    accountType: text(formData, 'accountType'),
    country: text(formData, 'country'),
    consent: text(formData, 'consent'),
    independent: text(formData, 'independent'),
    firmName: text(formData, 'firmName'),
    acceptTerms: text(formData, 'acceptTerms'),
    confirmConflicts: text(formData, 'confirmConflicts'),
    registrations: jurisdictions.map((jurisdiction, i) => ({
      jurisdiction,
      number: numbers[i] ?? '',
    })),
  };
}

/**
 * Finishes onboarding: validates the form and writes the account type to Clerk. The type goes in `publicMetadata`, which only
 * the server can write, so nobody can promote themselves. The details go in `privateMetadata` until we have our own tables.
 * Counsel start as `pending`; only staff move them to `verified`. It does nothing for someone who is already set up, so the
 * type cannot be changed by sending the form again.
 * @param _state - The previous form state (unused).
 * @param formData - The submitted form.
 * @returns The failed fields; on success it redirects to the dashboard instead.
 */
export async function completeOnboarding(
  _state: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const locale = await getLocale();
  const { userId } = await auth();

  if (!userId) {
    return redirect(getI18nPath('/sign-in', locale));
  }

  const user = await currentUser();

  if (parseAccount(user?.publicMetadata)) {
    return redirect(getI18nPath('/dashboard', locale));
  }

  const parsed = OnboardingValidation.safeParse(readForm(formData));

  if (!parsed.success) {
    return { errors: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))] };
  }

  const at = new Date().toISOString();
  const input = parsed.data;
  const client = await clerkClient();

  await client.users.updateUserMetadata(userId, {
    publicMetadata:
      input.accountType === 'person'
        ? { accountType: 'person' }
        : { accountType: 'counsel', review: 'pending' },
    privateMetadata:
      input.accountType === 'person'
        ? { country: input.country, consent: { version: consentVersion, at } }
        : {
            firm: input.independent === 'on' ? null : input.firmName,
            registrations: input.registrations,
            terms: { version: consentVersion, at },
          },
  });

  return redirect(getI18nPath('/dashboard', locale));
}

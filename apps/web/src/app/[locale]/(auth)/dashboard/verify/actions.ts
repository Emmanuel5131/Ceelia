'use server';

import { auth } from '@clerk/nextjs/server';
import { IdswyftError, IdswyftSDK } from '@idswyft/sdk';
import { sql } from 'drizzle-orm';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import type { FormState } from '@/hooks/use-form-action';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { getIdentityCheck, identityRequired } from '@/libs/Identity';
import { logger } from '@/libs/Logger';
import { identityCheckSchema } from '@/models/Schema';
import { getI18nPath } from '@/utils/Helpers';
import { identityMaxAttempts, identityOutcome } from '@/utils/IdentityCheck';

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const imageBytes = 4 * 1024 * 1024;
type DocumentType = 'national_id' | 'drivers_license';

const failed = (errors: string[]): FormState => ({ errors });

const documentTypeOf = (value: FormDataEntryValue | null): DocumentType | undefined =>
  value === 'national_id' || value === 'drivers_license' ? value : undefined;

const image = (formData: FormData, name: string) => {
  const file = formData.get(name);

  return file instanceof File &&
    file.size > 0 &&
    file.size <= imageBytes &&
    imageTypes.has(file.type)
    ? file
    : undefined;
};

const toBuffer = async (file: File) => Buffer.from(await file.arrayBuffer());

/**
 * Reads the form: the kind of ID, the three photos and the agreement.
 * @param formData - The submitted form.
 * @returns What is ready to check, or the names of the fields that are missing or not acceptable.
 */
function readForm(formData: FormData) {
  const documentType = documentTypeOf(formData.get('documentType'));
  const front = image(formData, 'front');
  const back = image(formData, 'back');
  const selfie = image(formData, 'selfie');
  const missing = [
    ...(documentType ? [] : ['documentType']),
    ...(front ? [] : ['front']),
    ...(back ? [] : ['back']),
    ...(selfie ? [] : ['selfie']),
    ...(formData.get('consent') === 'on' ? [] : ['consent']),
  ];

  return documentType && front && back && selfie && missing.length === 0
    ? ({ ok: true, documentType, files: { front, back, selfie } } as const)
    : ({ ok: false, missing } as const);
}

/**
 * Runs the checks Idswyft makes, in its order: the front of the ID, the back, then the selfie. The photos are passed on and not
 * kept. A step that Idswyft rejects ends the check.
 * @param userId - The person.
 * @param documentType - The kind of ID.
 * @param files - The three photos.
 * @param files.front - The front of the ID.
 * @param files.back - The back of the ID.
 * @param files.selfie - The selfie.
 * @returns The Idswyft verification id and the outcome, or `unavailable` when Idswyft could not be reached.
 */
async function runCheck(
  userId: string,
  documentType: DocumentType,
  files: { front: File; back: File; selfie: File },
) {
  const client = new IdswyftSDK({
    apiKey: Env.IDSWYFT_API_KEY ?? '',
    sandbox: Env.IDSWYFT_SANDBOX === 'true',
  });
  const front = await toBuffer(files.front);
  const back = await toBuffer(files.back);
  const selfie = await toBuffer(files.selfie);

  try {
    const { verification_id: id } = await client.startVerification({
      user_id: userId,
      document_type: documentType,
    });
    const first = await client.uploadFrontDocument(id, front, documentType);

    if (first.rejection_reason) {
      return { id, outcome: 'failed' as const };
    }

    const second = await client.uploadBackDocument(id, back, documentType);

    if (second.rejection_reason) {
      return { id, outcome: 'failed' as const };
    }

    const last = await client.uploadSelfie(id, selfie);

    return { id, outcome: identityOutcome(last.rejection_reason ? null : last.final_result) };
  } catch (error) {
    // Idswyft refusing the photos is the person's result; anything else means we could not check.
    const refused =
      error instanceof IdswyftError &&
      error.statusCode >= 400 &&
      error.statusCode < 500 &&
      error.statusCode !== 401 &&
      error.statusCode !== 429;

    if (refused) {
      return { id: null, outcome: 'failed' as const };
    }

    logger.error(
      `Idswyft check could not run: ${error instanceof Error ? error.message : 'unknown'}`,
    );

    return { id: null, outcome: 'unavailable' as const };
  }
}

/**
 * The one-time identity check. The person gives the front and back of an ID and a selfie, Idswyft checks them, and Celia keeps
 * only the result. Passing sends them on to report their loss; anything but a pass leaves them unverified.
 * @param _state - The previous state (unused).
 * @param formData - The submitted form: `documentType`, `front`, `back`, `selfie` and `consent`.
 * @returns The failed fields, `rejected` when Idswyft did not pass them, `unavailable` when it could not be reached, or
 *   `attempts` when they have tried too often. A pass redirects.
 */
export async function verifyIdentity(_state: FormState, formData: FormData): Promise<FormState> {
  const { userId } = await auth();
  const locale = await getLocale();

  if (!userId) {
    return redirect(getI18nPath('/sign-in', locale));
  }

  const claims = getI18nPath('/dashboard/claims/new', locale);
  const existing = await getIdentityCheck(userId);

  if (!identityRequired() || existing?.status === 'verified') {
    return redirect(claims);
  }

  const form = readForm(formData);

  if (!form.ok) {
    return failed(form.missing);
  }

  if ((existing?.attempts ?? 0) >= identityMaxAttempts) {
    return failed(['attempts']);
  }

  const { id, outcome } = await runCheck(userId, form.documentType, form.files);

  if (outcome === 'unavailable') {
    return failed(['unavailable']);
  }

  const verified = outcome === 'verified';
  const verifiedAt = verified ? new Date() : null;

  await db
    .insert(identityCheckSchema)
    .values({ userId, status: outcome, verificationId: id, verifiedAt })
    .onConflictDoUpdate({
      target: identityCheckSchema.userId,
      set: {
        status: outcome,
        verificationId: id,
        verifiedAt,
        attempts: sql`${identityCheckSchema.attempts} + 1`,
      },
    });

  return verified ? redirect(claims) : failed(['rejected']);
}

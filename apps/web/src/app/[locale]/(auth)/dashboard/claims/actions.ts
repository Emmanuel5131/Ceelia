'use server';

import { canVerifyOwnership, ownershipMessage, platformKey, verifyOwnership } from '@celia/core';
import { auth, currentUser } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { getLocale } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getClaim } from '@/libs/Claims';
import { db } from '@/libs/DB';
import { claimSchema } from '@/models/Schema';
import { parseAccount } from '@/utils/Account';
import { getI18nPath } from '@/utils/Helpers';
import {
  CreateClaimValidation,
  SignatureValidation,
  StatementValidation,
} from '@/validations/ClaimValidation';

export type ClaimState = {
  /** The names of the fields that failed, or a reason such as `duplicate` or `signature`. */
  errors: string[];
  /** Set when the action succeeded and stays on the page. */
  done?: boolean;
};

const failed = (errors: string[]): ClaimState => ({ errors });

const text = (formData: FormData, name: string) => formData.get(name) ?? undefined;

/**
 * Finds the signed-in person and refuses anyone who is not a `person` account: counsel cannot file claims.
 * @returns The user id and the Clerk user, or a redirect to the dashboard.
 */
async function requirePerson() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || parseAccount(user?.publicMetadata)?.accountType !== 'person') {
    return redirect(getI18nPath('/dashboard', await getLocale()));
  }

  return { userId, user };
}

/**
 * Starts a claim: checks the wallet and the platform and creates a draft. The one-time nonce for the ownership message is
 * made here, so it cannot be chosen by the person. Filing the same wallet for the same platform twice is refused.
 * @param _state - The previous state (unused).
 * @param formData - The submitted form.
 * @returns The failed fields; on success it redirects to the claim.
 */
export async function createClaim(_state: ClaimState, formData: FormData): Promise<ClaimState> {
  const { userId, user } = await requirePerson();
  const parsed = CreateClaimValidation.safeParse({
    chain: text(formData, 'chain'),
    walletAddress: text(formData, 'walletAddress'),
    platformName: text(formData, 'platformName'),
    platformUrl: text(formData, 'platformUrl'),
  });

  if (!parsed.success) {
    return failed([...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))]);
  }

  const { chain, walletAddress, platformName, platformUrl } = parsed.data;
  const key = platformKey(platformName);
  const [existing] = await db
    .select({ id: claimSchema.id })
    .from(claimSchema)
    .where(
      and(
        eq(claimSchema.userId, userId),
        eq(claimSchema.chain, chain),
        eq(claimSchema.walletAddress, walletAddress),
        eq(claimSchema.platformKey, key),
      ),
    );

  if (existing) {
    return failed(['duplicate']);
  }

  const country = user?.privateMetadata.country;
  const [created] = await db
    .insert(claimSchema)
    .values({
      userId,
      chain,
      walletAddress,
      platformName,
      platformKey: key,
      platformUrl: platformUrl === '' ? null : (platformUrl ?? null),
      country: typeof country === 'string' ? country : null,
      nonce: crypto.randomUUID(),
    })
    .returning({ id: claimSchema.id });

  return redirect(getI18nPath(`/dashboard/claims/${created?.id}`, await getLocale()));
}

/**
 * Checks the signature a person pasted against their wallet and, if it matches, marks ownership as proven. A wrong signature
 * changes nothing.
 * @param claimId - The claim being proven.
 * @param _state - The previous state (unused).
 * @param formData - The submitted form.
 * @returns `done` when the wallet is confirmed; otherwise the reason.
 */
export async function verifyClaimOwnership(
  claimId: string,
  _state: ClaimState,
  formData: FormData,
): Promise<ClaimState> {
  const { userId } = await requirePerson();
  const claim = await getClaim(userId, claimId);
  const parsed = SignatureValidation.safeParse({ signature: text(formData, 'signature') });

  if (!claim) {
    return failed(['claim']);
  }

  if (!parsed.success) {
    return failed(['signature']);
  }

  const { chain } = claim;

  if (!canVerifyOwnership(chain)) {
    return failed(['unsupported']);
  }

  const message = ownershipMessage({ chain, address: claim.walletAddress, nonce: claim.nonce });

  if (
    !verifyOwnership({
      chain,
      address: claim.walletAddress,
      message,
      signature: parsed.data.signature,
    })
  ) {
    return failed(['signature']);
  }

  await db
    .update(claimSchema)
    .set({ ownership: 'signed', signature: parsed.data.signature, signedAt: new Date() })
    .where(eq(claimSchema.id, claim.id));
  revalidatePath(getI18nPath(`/dashboard/claims/${claim.id}`, await getLocale()));

  return { errors: [], done: true };
}

/**
 * Saves what the person says happened. It can be edited after the claim is sent.
 * @param claimId - The claim.
 * @param _state - The previous state (unused).
 * @param formData - The submitted form.
 * @returns `done` when saved; otherwise the failed field.
 */
export async function saveStatement(
  claimId: string,
  _state: ClaimState,
  formData: FormData,
): Promise<ClaimState> {
  const { userId } = await requirePerson();
  const claim = await getClaim(userId, claimId);
  const parsed = StatementValidation.safeParse({ statement: text(formData, 'statement') });

  if (!claim) {
    return failed(['claim']);
  }

  if (!parsed.success) {
    return failed(['statement']);
  }

  await db
    .update(claimSchema)
    .set({ statement: parsed.data.statement })
    .where(eq(claimSchema.id, claim.id));
  revalidatePath(getI18nPath(`/dashboard/claims/${claim.id}`, await getLocale()));

  return { errors: [], done: true };
}

/**
 * Sends the claim. It needs the person's account of what happened. Ownership may still be unconfirmed (an exchange account
 * cannot sign, and some chains cannot be checked yet); the file then shows it as not confirmed.
 * @param claimId - The claim.
 * @returns `done` when sent; otherwise `statement` if the account is missing.
 */
export async function submitClaim(claimId: string): Promise<ClaimState> {
  const { userId } = await requirePerson();
  const claim = await getClaim(userId, claimId);

  if (!claim) {
    return failed(['claim']);
  }

  if (!claim.statement) {
    return failed(['statement']);
  }

  await db
    .update(claimSchema)
    .set({ status: 'submitted', submittedAt: new Date() })
    .where(eq(claimSchema.id, claim.id));
  revalidatePath(getI18nPath(`/dashboard/claims/${claim.id}`, await getLocale()));

  return { errors: [], done: true };
}

'use server';

import {
  canVerifyOwnership,
  ownershipMessage,
  platformHost,
  platformKey,
  verifyOwnership,
} from '@celia/core';
import { auth, currentUser } from '@clerk/nextjs/server';
import { and, eq, isNull } from 'drizzle-orm';
import { getLocale } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type * as z from 'zod';
import { getClaim } from '@/libs/Claims';
import { db } from '@/libs/DB';
import { notify } from '@/libs/Notify';
import { saveLocale } from '@/libs/UserSettings';
import { caseSchema, claimSchema } from '@/models/Schema';
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

const names = [
  'fraudType',
  'paymentMethod',
  'chain',
  'walletAddress',
  'txHash',
  'unknownOperator',
  'platformName',
  'platformUrl',
  'operatorHandle',
  'tokenContract',
  'contactChannel',
  'amountLost',
] as const;

/**
 * Reads the new-claim form into the shape the validation expects. An empty answer, such as an unchosen "how did it start?",
 * is left out.
 * @param formData - The submitted form.
 * @returns The raw input.
 */
function readClaimForm(formData: FormData) {
  const input: Record<string, FormDataEntryValue> = {};

  for (const name of names) {
    const value = formData.get(name);

    if (value !== null && value !== '') {
      input[name] = value;
    }
  }

  return input;
}

type NewClaim = z.infer<typeof CreateClaimValidation>;

/**
 * Finds a claim this person has already filed for the same wallet and operator, or for the same transaction.
 * @param input - What to compare.
 * @param input.userId - The Clerk user id.
 * @param input.claim - The validated new claim.
 * @param input.key - The operator's pooling key, or an empty string when unnamed.
 * @returns The earlier claim's id, if there is one.
 */
async function findDuplicate(input: { userId: string; claim: NewClaim; key: string }) {
  const { userId, claim, key } = input;
  const same =
    claim.paymentMethod === 'wallet'
      ? and(
          eq(claimSchema.chain, claim.chain),
          eq(claimSchema.walletAddress, claim.walletAddress ?? ''),
          key ? eq(claimSchema.platformKey, key) : isNull(claimSchema.platformKey),
        )
      : eq(claimSchema.txHash, claim.txHash ?? '');
  const [existing] = await db
    .select({ id: claimSchema.id })
    .from(claimSchema)
    .where(and(eq(claimSchema.userId, userId), same));

  return existing;
}

/**
 * Turns a validated claim into the row to store. The operator's name, website host and token contract are normalised here so
 * claims about the same operator can be pooled.
 * @param claim - The validated new claim.
 * @param named - The operator's name, if known.
 * @returns The columns, except the owner and the country.
 */
function claimColumns(claim: NewClaim, named: string | undefined) {
  const key = named ? platformKey(named) : '';

  return {
    fraudType: claim.fraudType,
    paymentMethod: claim.paymentMethod,
    chain: claim.chain,
    walletAddress: claim.paymentMethod === 'wallet' ? (claim.walletAddress ?? null) : null,
    txHash: claim.txHash ?? null,
    platformName: named ?? null,
    platformKey: key === '' ? null : key,
    platformUrl: claim.platformUrl ?? null,
    platformHost: claim.platformUrl ? (platformHost(claim.platformUrl) ?? null) : null,
    operatorHandle: claim.operatorHandle ?? null,
    tokenContract: claim.tokenContract?.toLowerCase() ?? null,
    contactChannel: claim.contactChannel ?? null,
    amountLost: claim.amountLost ?? null,
    nonce: crypto.randomUUID(),
  };
}

/**
 * Starts a claim: checks what happened, how it was paid and who took the money, and creates a draft. The one-time nonce for
 * the ownership message is made here, so it cannot be chosen by the person. Filing the same wallet for the same operator, or
 * the same transaction, twice is refused.
 * @param _state - The previous state (unused).
 * @param formData - The submitted form.
 * @returns The failed fields; on success it redirects to the claim.
 */
export async function createClaim(_state: ClaimState, formData: FormData): Promise<ClaimState> {
  const { userId, user } = await requirePerson();
  const parsed = CreateClaimValidation.safeParse(readClaimForm(formData));

  if (!parsed.success) {
    return failed([...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))]);
  }

  const claim = parsed.data;
  const named = claim.unknownOperator === 'on' ? undefined : claim.platformName;

  if (await findDuplicate({ userId, claim, key: named ? platformKey(named) : '' })) {
    return failed(['duplicate']);
  }

  const country = user?.privateMetadata.country;
  const [created] = await db
    .insert(claimSchema)
    .values({
      ...claimColumns(claim, named),
      userId,
      country: typeof country === 'string' ? country : null,
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

  if (!claim?.walletAddress) {
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

  const locale = await getLocale();
  await saveLocale(userId, locale);
  await db.transaction(async (tx) => {
    await tx
      .update(claimSchema)
      .set({ ownership: 'signed', signature: parsed.data.signature, signedAt: new Date() })
      .where(eq(claimSchema.id, claim.id));
    await notify(tx, [
      {
        userId,
        type: 'ownership_confirmed',
        dedupeKey: `ownership_confirmed:${claim.id}`,
        data: { claimId: claim.id },
      },
    ]);
  });
  revalidatePath(getI18nPath(`/dashboard/claims/${claim.id}`, locale));

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

  const locale = await getLocale();
  await saveLocale(userId, locale);
  await db.transaction(async (tx) => {
    await tx
      .update(claimSchema)
      .set({ status: 'submitted', submittedAt: new Date() })
      .where(eq(claimSchema.id, claim.id));

    // When a case already exists for this platform, the claim joins it the moment it is sent.
    const [existing] = claim.platformKey
      ? await tx
          .select({ id: caseSchema.id })
          .from(caseSchema)
          .where(eq(caseSchema.platformKey, claim.platformKey))
      : [];

    await notify(tx, [
      {
        userId,
        type: 'claim_submitted',
        dedupeKey: `claim_submitted:${claim.id}`,
        data: { claimId: claim.id },
      },
      ...(existing
        ? [
            {
              userId,
              type: 'claim_in_case' as const,
              dedupeKey: `claim_in_case:${existing.id}`,
              data: { caseId: existing.id },
            },
          ]
        : []),
    ]);
  });
  revalidatePath(getI18nPath(`/dashboard/claims/${claim.id}`, locale));

  return { errors: [], done: true };
}

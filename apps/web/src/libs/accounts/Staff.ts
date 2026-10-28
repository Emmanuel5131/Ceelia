import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { getLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { getUsersById } from '@/libs/accounts/ClerkUsers';
import { saveCounselProfile } from '@/libs/accounts/CounselProfile';
import { listOwnershipReviews, queueLimit } from '@/libs/claims/ClaimProofs';
import { signalsFor } from '@/libs/claims/Signals';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { claimSchema } from '@/models/Schema';
import { parseAccount } from '@/utils/accounts/Account';
import { parseProfile } from '@/utils/accounts/Profile';
import { parseStaffEmails, staffAccess } from '@/utils/accounts/StaffAccess';
import { getI18nPath } from '@/utils/Helpers';

/**
 * Decides whether a signed-in person can use the staff area. See `staffAccess` for the rules.
 * @param user - The signed-in person, or null.
 * @returns `allowed`, or the first reason not.
 */
export function staffDecision(
  user: { publicMetadata: UserPublicMetadata } & Pick<
    NonNullable<Awaited<ReturnType<typeof currentUser>>>,
    'primaryEmailAddress' | 'twoFactorEnabled'
  >,
) {
  const primary = user.primaryEmailAddress;
  const staffDomain = Env.STAFF_EMAIL_DOMAIN?.trim().toLowerCase();

  return staffAccess({
    staff: parseAccount(user.publicMetadata)?.staff === true,
    email: primary?.verification?.status === 'verified' ? primary.emailAddress : null,
    twoFactor: user.twoFactorEnabled,
    allowed: parseStaffEmails(Env.STAFF_EMAILS),
    domain: staffDomain === undefined || staffDomain === '' ? null : staffDomain,
    production: Env.NODE_ENV === 'production',
  });
}

/**
 * Lets only Celia staff through. Anyone else gets a 404, so the area does not show that it exists. Every staff page and every
 * staff action calls this first, because hiding a link is not access control. Staff who have not turned on two-step sign-in are
 * sent to do that first, unless the page is the one that helps them (`twoFactor: false`).
 * @param options - How strict to be.
 * @param options.twoFactor - Whether two-step sign-in is required; true unless set to false.
 * @returns The signed-in staff member.
 */
export async function requireStaff(options?: { twoFactor?: boolean }) {
  const user = await currentUser();

  if (!user) {
    return notFound();
  }

  const decision = staffDecision(user);

  if (decision === 'needs_two_factor' && options?.twoFactor === false) {
    return user;
  }

  if (decision === 'needs_two_factor') {
    return redirect(getI18nPath('/dashboard/staff/secure', await getLocale()));
  }

  return decision === 'allowed' ? user : notFound();
}

/**
 * Copies every lawyer in Clerk into our own table. Lawyers who signed up before the table existed are not in it, so they would
 * be missing from the queue and from the lawyers a case is announced to. It is safe to run again: it only writes what Clerk says.
 * Clerk cannot filter on metadata, so this reads up to 500 recent users.
 * @returns How many lawyers it copied.
 */
export async function syncCounselProfiles() {
  const client = await clerkClient();
  const { data } = await client.users.getUserList({ limit: 500, orderBy: '+created_at' });
  let copied = 0;

  for (const user of data) {
    const account = parseAccount(user.publicMetadata);
    const profile = parseProfile('counsel', user.privateMetadata);

    if (account?.accountType === 'counsel' && profile?.accountType === 'counsel') {
      // One lawyer at a time is fine: this runs by hand, rarely.
      // oxlint-disable-next-line eslint/no-await-in-loop
      await saveCounselProfile(db, {
        userId: user.id,
        review: account.review === 'verified' ? 'verified' : 'pending',
        firm: profile.firm,
        jurisdictions: profile.jurisdictions,
      });
      copied += 1;
    }
  }

  return copied;
}

/**
 * Lists the wallets waiting for staff to confirm, with who to write to about each one. The name and email come from Clerk and are
 * only for staff.
 * @returns The claims waiting, oldest request first.
 */
export async function listOwnershipQueue() {
  const reviews = await listOwnershipReviews();

  if (reviews.length === 0) {
    return [];
  }

  const users = await getUsersById(reviews.map((review) => review.userId));

  return reviews.map((review) => {
    const user = users.get(review.userId);

    return {
      ...review,
      requestedAt: review.requestedAt?.toISOString() ?? null,
      name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
    };
  });
}

export type OwnershipQueueItem = Awaited<ReturnType<typeof listOwnershipQueue>>[number];

/**
 * Lists the oldest sent claims waiting for staff to validate, with who to write to about each one and the reasons to look closer
 * at it. The name and email come from Clerk and are only for staff.
 * @returns The claims waiting.
 */
export async function listClaimsToValidate() {
  const rows = await db
    .select({
      id: claimSchema.id,
      userId: claimSchema.userId,
      platformName: claimSchema.platformName,
      fraudType: claimSchema.fraudType,
      chain: claimSchema.chain,
      amountLost: claimSchema.amountLost,
      ownership: claimSchema.ownership,
      submittedAt: claimSchema.submittedAt,
      walletAddress: claimSchema.walletAddress,
      txHash: claimSchema.txHash,
      fundingTxHash: claimSchema.fundingTxHash,
      txCheck: claimSchema.txCheck,
      platformKey: claimSchema.platformKey,
    })
    .from(claimSchema)
    .where(and(eq(claimSchema.status, 'submitted'), isNull(claimSchema.validatedAt)))
    .orderBy(asc(claimSchema.submittedAt))
    // The oldest first; the rest appear as these are confirmed.
    .limit(queueLimit);

  if (rows.length === 0) {
    return [];
  }

  const signals = await signalsFor(rows);

  const users = await getUsersById(rows.map((row) => row.userId));

  return rows.map((row) => {
    const user = users.get(row.userId);

    return {
      id: row.id,
      platformName: row.platformName,
      fraudType: row.fraudType,
      chain: row.chain,
      amountLost: row.amountLost,
      signed: row.ownership === 'signed',
      signals: signals.get(row.id) ?? [],
      submittedAt: row.submittedAt?.toISOString() ?? null,
      name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
    };
  });
}

export type ClaimToValidate = Awaited<ReturnType<typeof listClaimsToValidate>>[number];

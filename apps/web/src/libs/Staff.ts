import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { listOwnershipReviews } from '@/libs/ClaimProofs';
import { saveCounselProfile } from '@/libs/CounselProfile';
import { db } from '@/libs/DB';
import { claimSchema, counselProfileSchema } from '@/models/Schema';
import { parseAccount } from '@/utils/Account';
import { getI18nPath } from '@/utils/Helpers';
import { parseProfile } from '@/utils/Profile';

/**
 * Lets only Celia staff through. Anyone else goes back to the dashboard. Every staff page and every staff action calls this
 * first, because hiding a link is not access control.
 * @returns The signed-in staff member.
 */
export async function requireStaff() {
  const user = await currentUser();

  if (!user || !parseAccount(user.publicMetadata)?.staff) {
    return redirect(getI18nPath('/dashboard', await getLocale()));
  }

  return user;
}

export type PendingCounsel = {
  id: string;
  name: string;
  email: string;
  firm: string | null;
  jurisdictions: string[];
  createdAt: string;
};

/**
 * Lists the lawyers waiting for staff to check them, oldest first. The review status and jurisdictions come from our own copy
 * of each lawyer; only the name and email are read from Clerk.
 * @returns The pending lawyers.
 */
export async function listPendingCounsel() {
  const rows = await db
    .select()
    .from(counselProfileSchema)
    .where(eq(counselProfileSchema.review, 'pending'))
    .orderBy(asc(counselProfileSchema.createdAt));

  if (rows.length === 0) {
    return [];
  }

  const client = await clerkClient();
  const { data } = await client.users.getUserList({
    userId: rows.map((row) => row.userId),
    limit: 500,
  });
  const users = new Map(data.map((user) => [user.id, user]));

  return rows.flatMap((row): PendingCounsel[] => {
    const user = users.get(row.userId);

    return user
      ? [
          {
            id: row.userId,
            name: [user.firstName, user.lastName].filter(Boolean).join(' '),
            email: user.primaryEmailAddress?.emailAddress ?? '',
            firm: row.firm,
            jurisdictions: row.jurisdictions,
            createdAt: row.createdAt.toISOString(),
          },
        ]
      : [];
  });
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

  const client = await clerkClient();
  const { data } = await client.users.getUserList({
    userId: reviews.map((review) => review.userId),
    limit: 500,
  });
  const users = new Map(data.map((user) => [user.id, user]));

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
 * Lists the sent claims waiting for staff to validate, oldest first, with who to write to about each one. The name and email come
 * from Clerk and are only for staff.
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
    })
    .from(claimSchema)
    .where(and(eq(claimSchema.status, 'submitted'), isNull(claimSchema.validatedAt)))
    .orderBy(asc(claimSchema.submittedAt));

  if (rows.length === 0) {
    return [];
  }

  const client = await clerkClient();
  const { data } = await client.users.getUserList({
    userId: [...new Set(rows.map((row) => row.userId))],
    limit: 500,
  });
  const users = new Map(data.map((user) => [user.id, user]));

  return rows.map((row) => {
    const user = users.get(row.userId);

    return {
      id: row.id,
      platformName: row.platformName,
      fraudType: row.fraudType,
      chain: row.chain,
      amountLost: row.amountLost,
      confirmed: row.ownership === 'signed',
      submittedAt: row.submittedAt?.toISOString() ?? null,
      name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
    };
  });
}

export type ClaimToValidate = Awaited<ReturnType<typeof listClaimsToValidate>>[number];

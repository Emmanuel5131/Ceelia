import { clerkClient } from '@clerk/nextjs/server';

/**
 * Reads the names of claimants from Clerk, for the people allowed to see them. A person Clerk does not know (for example a
 * sample claimant) has no entry.
 * @param userIds - The Clerk user ids.
 * @returns Each known person's name, by user id.
 */
export async function claimantNames(userIds: string[]) {
  const unique = [...new Set(userIds)];

  if (unique.length === 0) {
    return new Map<string, string>();
  }

  const client = await clerkClient();
  const { data } = await client.users.getUserList({ userId: unique, limit: 500 });

  // A person with no name in Clerk gets no entry, so callers can fall back with `??`.
  return new Map(
    data.flatMap((user): [string, string][] => {
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ');

      return name ? [[user.id, name]] : [];
    }),
  );
}

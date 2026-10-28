import { getUsersById } from '@/libs/accounts/ClerkUsers';

/**
 * Reads the names of claimants from Clerk, for the people allowed to see them. A person Clerk does not know (for example a
 * sample claimant) has no entry.
 * @param userIds - The Clerk user ids.
 * @returns Each known person's name, by user id.
 */
export async function claimantNames(userIds: string[]) {
  const users = await getUsersById(userIds);

  // A person with no name in Clerk gets no entry, so callers can fall back with `??`.
  return new Map(
    [...users.values()].flatMap((user): [string, string][] => {
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ');

      return name ? [[user.id, name]] : [];
    }),
  );
}

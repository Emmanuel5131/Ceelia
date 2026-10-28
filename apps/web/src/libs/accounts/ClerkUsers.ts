import { clerkClient } from '@clerk/nextjs/server';
import type { User } from '@clerk/nextjs/server';

// Clerk takes the ids in the address of the request, so a long list is refused ("URI Too Long"). Fifty ids stay well inside it.
const batchSize = 50;

/**
 * Reads people from Clerk by their ids, in batches so a long list never makes the request too long. A person Clerk does not
 * know (for example a sample claimant) has no entry.
 * @param userIds - The Clerk user ids; repeats are read once.
 * @returns Each known person, by user id.
 */
export async function getUsersById(userIds: string[]) {
  const unique = [...new Set(userIds)];

  if (unique.length === 0) {
    return new Map<string, User>();
  }

  const client = await clerkClient();
  const batches = Array.from({ length: Math.ceil(unique.length / batchSize) }, (_, index) =>
    unique.slice(index * batchSize, (index + 1) * batchSize),
  );
  const pages = await Promise.all(
    batches.map(
      async (batch) => await client.users.getUserList({ userId: batch, limit: batchSize }),
    ),
  );

  return new Map(pages.flatMap((page) => page.data).map((user) => [user.id, user]));
}

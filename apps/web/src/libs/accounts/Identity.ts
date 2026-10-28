import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { identityCheckSchema } from '@/models/Schema';

/**
 * Whether the identity check is on. It is on in production when an Idswyft key is set, so a setup without one never locks anybody
 * out, and development never asks for it.
 * @returns True when people must pass the check.
 */
export function identityRequired() {
  return Env.NODE_ENV === 'production' && Boolean(Env.IDSWYFT_API_KEY);
}

/**
 * A person's identity check, if they have tried it.
 * @param userId - The Clerk user id.
 * @returns The check, or undefined.
 */
export async function getIdentityCheck(userId: string) {
  const [check] = await db
    .select()
    .from(identityCheckSchema)
    .where(eq(identityCheckSchema.userId, userId));

  return check;
}

/**
 * Whether a person still has to pass the identity check before they can report a loss.
 * @param userId - The Clerk user id.
 * @returns True when the check is on and they have not passed it.
 */
export async function mustVerify(userId: string) {
  if (!identityRequired()) {
    return false;
  }

  const check = await getIdentityCheck(userId);

  return check?.status !== 'verified';
}

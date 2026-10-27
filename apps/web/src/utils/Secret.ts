import { timingSafeEqual } from 'node:crypto';

/**
 * Compares a secret a caller sent with the one we hold, in constant time so the comparison does not reveal how much matched.
 * @param given - What the caller sent.
 * @param expected - The secret we hold, or nothing when it is not set.
 * @returns True only when a secret is set and they are equal.
 */
export function matchesSecret(given: string | null, expected?: string | null) {
  if (!given || !expected) {
    return false;
  }

  const a = Buffer.from(given);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

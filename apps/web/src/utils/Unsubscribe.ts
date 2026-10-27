import { createHmac, timingSafeEqual } from 'node:crypto';
import { optionalCategories } from '@celia/core';
import type { OptionalCategory } from '@celia/core';

export type UnsubscribeClaim = { userId: string; category: OptionalCategory };

const sign = (secret: string, body: string) =>
  createHmac('sha256', secret).update(body).digest('base64url');

/**
 * Makes the token in an unsubscribe link. It names the person and the category and is signed, so nobody can unsubscribe someone
 * else or forge a link, and it needs no sign-in because the person opens it from their email. It does not expire: an old email
 * must still work.
 * @param secret - The signing secret.
 * @param claim - Whose email, and which category to turn off.
 * @returns The token.
 */
export function signUnsubscribe(secret: string, claim: UnsubscribeClaim) {
  const body = Buffer.from(JSON.stringify([claim.userId, claim.category])).toString('base64url');

  return `${body}.${sign(secret, body)}`;
}

/**
 * Checks an unsubscribe token.
 * @param secret - The signing secret.
 * @param token - The token from the link.
 * @returns Whose email and which category, or null when the token is not valid.
 */
export function verifyUnsubscribe(secret: string, token: string): UnsubscribeClaim | null {
  const [body, signature] = token.split('.');

  if (!body || !signature) {
    return null;
  }

  const expected = Buffer.from(sign(secret, body));
  const given = Buffer.from(signature);

  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }

  const parsed: unknown = JSON.parse(Buffer.from(body, 'base64url').toString());
  const [userId, category] = Array.isArray(parsed) ? parsed : [];
  const known = optionalCategories.find((value) => value === category);

  return typeof userId === 'string' && known ? { userId, category: known } : null;
}

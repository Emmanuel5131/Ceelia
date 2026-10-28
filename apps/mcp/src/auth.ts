import type { IncomingMessage } from 'node:http';
import * as z from 'zod';

/** What a caller is on Celia. A tool set is chosen from it, and the web app checks it again on every request. */
export type Role = 'staff' | 'counsel' | 'person';

/** Who is calling. The token is passed on to the web app, so every tool acts as this person and nothing more. */
export type Caller = {
  userId: string;
  role: Role;
  token: string;
};

export type Authenticator = (request: IncomingMessage) => Promise<Caller | null>;

const IdentityValidation = z.object({
  userId: z.string().min(1),
  role: z.enum(['staff', 'counsel', 'person']),
});

/**
 * Reads the bearer token from a request.
 * @param request - The request.
 * @returns The token, or null when there is none.
 */
export function bearerToken(request: IncomingMessage) {
  const [scheme, token] = (request.headers.authorization ?? '').split(' ');

  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

/**
 * Builds the check of who is calling. The server holds no Clerk secret and no user data: it asks the web app, which verifies the
 * OAuth token with Clerk, finds the person's role and applies the same staff rules as the staff area. Anything but a clear yes
 * is treated as not signed in.
 * @param webUrl - The Celia web app.
 * @returns The check.
 */
export function createAuthenticator(webUrl: string): Authenticator {
  return async (request) => {
    const token = bearerToken(request);

    if (!token) {
      return null;
    }

    const response = await fetch(`${webUrl}/api/mcp/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);

    if (!response?.ok) {
      return null;
    }

    const identity = IdentityValidation.safeParse(await response.json());

    return identity.success ? { ...identity.data, token } : null;
  };
}

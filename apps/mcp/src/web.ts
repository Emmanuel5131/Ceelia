import type { Caller } from './auth.ts';

/**
 * Builds the way tools ask the Celia web app for data, as the person who is calling. The web app decides what they may see; this
 * server only passes the question on and the answer back.
 * @param webUrl - The Celia web app.
 * @param caller - Who is calling.
 * @returns A function that reads one path as JSON.
 */
export function createWebClient(webUrl: string, caller: Caller) {
  return async (path: string): Promise<unknown> => {
    const response = await fetch(`${webUrl}${path}`, {
      headers: { Authorization: `Bearer ${caller.token}` },
      signal: AbortSignal.timeout(15_000),
    });

    if (response.status === 404) {
      throw new Error('Not found');
    }

    if (!response.ok) {
      throw new Error(`Celia could not answer (${response.status})`);
    }

    return await response.json();
  };
}

export type WebClient = ReturnType<typeof createWebClient>;

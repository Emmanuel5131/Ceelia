/** How many times a message is tried before it is given up on. */
export const maxMailAttempts = 8;

const baseDelayMs = 10 * 60 * 1000;
const maxDelayMs = 6 * 60 * 60 * 1000;

/**
 * - `retry`: a temporary problem (a busy server, a dropped connection); try again later.
 * - `permanent`: the server refused the message for good; do not try again.
 * - `bounce`: the address does not exist; do not try again and stop mailing it.
 */
export type FailureKind = 'retry' | 'permanent' | 'bounce';

export type MailError = { responseCode?: number; code?: string; response?: string };

/**
 * Reads the parts of a failed send that decide what to do next, from whatever was thrown: nodemailer's `responseCode` (the SMTP
 * reply number), `response` (the reply text) and `code` (a connection or request error).
 * @param error - The thrown value.
 * @returns What could be read; anything missing is left out.
 */
export function toMailError(error: unknown): MailError {
  if (typeof error !== 'object' || error === null) {
    return {};
  }

  return {
    responseCode:
      'responseCode' in error && typeof error.responseCode === 'number'
        ? error.responseCode
        : undefined,
    code: 'code' in error && typeof error.code === 'string' ? error.code : undefined,
    response:
      'response' in error && typeof error.response === 'string' ? error.response : undefined,
  };
}

// An address that cannot receive mail: 5.1.1 (no such user), 5.1.2 (no such domain), 5.1.0 (bad address).
const unknownRecipient = /\b5\.1\.[012]\b/u;

// Our own request was malformed, so another try would fail the same way.
const permanentCodes = new Set(['EENVELOPE', 'EMESSAGE']);

/**
 * Sorts a failed send into what to do next, from the error nodemailer reports: the SMTP reply code and its text, or a
 * connection error code. Anything unclear is a retry, because the attempt limit already stops a message that never works.
 * @param error - The failure.
 * @returns What to do next.
 */
export function classifyFailure(error: MailError): FailureKind {
  // A refused login is our own setting being wrong, not the message: keep it queued until the setting is fixed.
  if (error.code === 'EAUTH') {
    return 'retry';
  }

  const reply = error.responseCode;

  // The server's own reply decides first. nodemailer also reports a refused recipient as `EENVELOPE`, so that code alone says
  // nothing about whether the refusal is temporary.
  if (reply !== undefined) {
    if (reply < 500) {
      return 'retry';
    }

    return unknownRecipient.test(error.response ?? '') ? 'bounce' : 'permanent';
  }

  return error.code && permanentCodes.has(error.code) ? 'permanent' : 'retry';
}

/**
 * When to try a message again: exponential, from 10 minutes up to 6 hours, with up to 20% jitter either way so a burst of
 * failures does not retry in one burst.
 * @param attempts - How many times it has been tried so far, at least 1.
 * @param now - The current time.
 * @param random - A number in [0, 1), for tests.
 * @returns The time of the next try, or null when the attempts are used up.
 */
export function nextAttemptAt(attempts: number, now: Date, random = Math.random()) {
  if (attempts >= maxMailAttempts) {
    return null;
  }

  const delay = Math.min(baseDelayMs * 2 ** (attempts - 1), maxDelayMs);
  const jitter = 1 + (random - 0.5) * 0.4;

  return new Date(now.getTime() + Math.round(delay * jitter));
}

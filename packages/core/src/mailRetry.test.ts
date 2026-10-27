import { describe, expect, it } from 'vitest';
import { classifyFailure, maxMailAttempts, nextAttemptAt, toMailError } from './mailRetry';

describe(classifyFailure, () => {
  it('retries a temporary refusal', () => {
    expect(classifyFailure({ responseCode: 451, response: '451 4.7.1 try later' })).toBe('retry');
  });

  it('retries a dropped connection', () => {
    expect(classifyFailure({ code: 'ETIMEDOUT' })).toBe('retry');
  });

  it('retries a failed login so the setting can be fixed', () => {
    expect(classifyFailure({ code: 'EAUTH', responseCode: 535 })).toBe('retry');
  });

  it('treats an unknown mailbox as a bounce', () => {
    expect(classifyFailure({ responseCode: 550, response: '550 5.1.1 no such user' })).toBe(
      'bounce',
    );
  });

  it('treats any other permanent refusal as permanent', () => {
    expect(classifyFailure({ responseCode: 554, response: '554 5.7.1 rejected as spam' })).toBe(
      'permanent',
    );
  });

  it('retries a refused recipient when the server says to try later', () => {
    expect(classifyFailure({ code: 'EENVELOPE', responseCode: 451 })).toBe('retry');
  });

  it('treats a refused recipient with an unknown-user reply as a bounce', () => {
    expect(
      classifyFailure({ code: 'EENVELOPE', responseCode: 550, response: '550 5.1.1 no such user' }),
    ).toBe('bounce');
  });

  it('treats a malformed address as permanent', () => {
    expect(classifyFailure({ code: 'EENVELOPE' })).toBe('permanent');
  });
});

describe(nextAttemptAt, () => {
  const now = new Date('2026-10-27T10:00:00Z');

  it('waits about ten minutes after the first failure', () => {
    expect(nextAttemptAt(1, now, 0.5)?.toISOString()).toBe('2026-10-27T10:10:00.000Z');
  });

  it('doubles the wait each time', () => {
    expect(nextAttemptAt(2, now, 0.5)?.toISOString()).toBe('2026-10-27T10:20:00.000Z');
    expect(nextAttemptAt(3, now, 0.5)?.toISOString()).toBe('2026-10-27T10:40:00.000Z');
  });

  it('never waits more than six hours', () => {
    expect(nextAttemptAt(7, now, 0.5)?.toISOString()).toBe('2026-10-27T16:00:00.000Z');
  });

  it('spreads the wait by up to a fifth either way', () => {
    expect(nextAttemptAt(1, now, 0)?.getTime()).toBe(now.getTime() + 8 * 60 * 1000);
    expect(nextAttemptAt(1, now, 0.999999)?.getTime()).toBeLessThanOrEqual(
      now.getTime() + 12 * 60 * 1000,
    );
  });

  it('gives up after the last attempt', () => {
    expect(nextAttemptAt(maxMailAttempts, now)).toBeNull();
  });
});

describe(toMailError, () => {
  it('reads the SMTP reply from an error', () => {
    const error = Object.assign(new Error('refused'), {
      responseCode: 550,
      response: '550 5.1.1 no such user',
      code: 'EENVELOPE',
    });

    expect(toMailError(error)).toStrictEqual({
      responseCode: 550,
      response: '550 5.1.1 no such user',
      code: 'EENVELOPE',
    });
  });

  it('reads nothing from a value that is not an error object', () => {
    expect(toMailError('nope')).toStrictEqual({});
    expect(toMailError(null)).toStrictEqual({});
  });
});

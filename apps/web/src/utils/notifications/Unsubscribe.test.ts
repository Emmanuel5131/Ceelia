import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { signUnsubscribe, verifyUnsubscribe } from './Unsubscribe';

const secret = 'a-secret-that-is-at-least-thirty-two-characters';

describe(verifyUnsubscribe, () => {
  it('reads back what was signed', () => {
    const token = signUnsubscribe(secret, { userId: 'user_1', category: 'cases' });

    expect(verifyUnsubscribe(secret, token)).toStrictEqual({ userId: 'user_1', category: 'cases' });
  });

  it('rejects a token signed with another secret', () => {
    const token = signUnsubscribe('another-secret-that-is-long-enough!!', {
      userId: 'user_1',
      category: 'cases',
    });

    expect(verifyUnsubscribe(secret, token)).toBeNull();
  });

  it('rejects a token whose body was changed', () => {
    const [, signature] = signUnsubscribe(secret, { userId: 'user_1', category: 'cases' }).split(
      '.',
    );
    const forged = Buffer.from(JSON.stringify(['user_2', 'cases'])).toString('base64url');

    expect(verifyUnsubscribe(secret, `${forged}.${signature}`)).toBeNull();
  });

  it('rejects text that is not a token', () => {
    expect(verifyUnsubscribe(secret, 'nonsense')).toBeNull();
    expect(verifyUnsubscribe(secret, '')).toBeNull();
  });

  it('rejects a correctly signed token for a category that cannot be turned off', () => {
    const body = Buffer.from(JSON.stringify(['user_1', 'account'])).toString('base64url');
    const signature = createHmac('sha256', secret).update(body).digest('base64url');

    expect(verifyUnsubscribe(secret, `${body}.${signature}`)).toBeNull();
  });
});

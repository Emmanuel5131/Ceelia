import { expect, test } from '@playwright/test';

// These routes sit under `/api`, which the proxy skips, so each must refuse a caller it cannot verify by itself.
test.describe('Notification routes', () => {
  test('refuses the drain route without the cron secret', async ({ request }) => {
    const response = await request.get('/api/notifications/drain');

    expect(response.status()).toBe(401);
  });

  test('refuses the drain route with a wrong secret', async ({ request }) => {
    const response = await request.get('/api/notifications/drain', {
      headers: { authorization: 'Bearer not-the-secret' },
    });

    expect(response.status()).toBe(401);
  });

  test('refuses a bounce report without the webhook secret', async ({ request }) => {
    const response = await request.post('/api/webhooks/mail', {
      data: { type: 'hard_bounce', email: 'someone@example.org' },
    });

    expect(response.status()).toBe(401);
  });

  test('refuses a one-click unsubscribe with a forged token', async ({ request }) => {
    const response = await request.post('/api/unsubscribe?token=forged.token');

    expect(response.status()).toBe(400);
  });

  test('sends the unsubscribe link to a confirmation page instead of unsubscribing', async ({
    request,
  }) => {
    const response = await request.get('/api/unsubscribe?token=abc', { maxRedirects: 0 });

    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain('/unsubscribe?token=abc');
  });
});

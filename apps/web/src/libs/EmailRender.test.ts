import { notificationTypes } from '@celia/core';
import { describe, expect, it } from 'vitest';
import { renderNotification } from './EmailRender';

const data = { claimId: 'claim-1', caseId: 'case-1' };

describe(renderNotification, () => {
  it.each(notificationTypes)('writes %s in English and French', async (type) => {
    const en = await renderNotification({ type, locale: 'en', data });
    const fr = await renderNotification({ type, locale: 'fr', data });

    expect(en.subject).not.toBe('');
    expect(fr.subject).not.toBe('');
    expect(fr.subject).not.toBe(en.subject);
    expect(en.html).toContain('lang="en"');
    expect(fr.html).toContain('lang="fr"');
  });

  it('links to the signed-in app, in the person’s language', async () => {
    const en = await renderNotification({ type: 'case_taken', locale: 'en', data });
    const fr = await renderNotification({ type: 'case_taken', locale: 'fr', data });

    expect(en.html).toContain('/dashboard/cases/case-1');
    expect(fr.html).toContain('/fr/dashboard/cases/case-1');
  });

  it('carries only ids, never claim detail, in the links', async () => {
    const email = await renderNotification({
      type: 'claim_submitted',
      locale: 'en',
      data: { claimId: 'claim-1' },
    });

    expect(email.text).toContain('/dashboard/claims/claim-1');
    expect(email.text).not.toMatch(/0x[\da-f]{8}/iu);
  });

  it('adds an unsubscribe link to optional updates only', async () => {
    const unsubscribeUrl = 'https://example.org/api/unsubscribe?token=t';
    const optional = await renderNotification({
      type: 'case_sealed',
      locale: 'en',
      data,
      unsubscribeUrl,
    });
    const essential = await renderNotification({
      type: 'counsel_verified',
      locale: 'en',
      data,
      unsubscribeUrl,
    });

    expect(optional.html).toContain(unsubscribeUrl);
    expect(essential.html).not.toContain(unsubscribeUrl);
  });

  it('says an account notice is always sent', async () => {
    const email = await renderNotification({ type: 'counsel_verified', locale: 'en', data });

    expect(email.text).toContain('always sent');
  });

  it('uses no exclamation marks and promises no recovery', async () => {
    const copy = await Promise.all(
      notificationTypes.flatMap((type) =>
        ['en', 'fr'].map(async (locale) => await renderNotification({ type, locale, data })),
      ),
    );
    const all = copy.map((email) => `${email.subject} ${email.text}`).join(' ');

    expect(all).not.toContain('!');
    expect(all).not.toMatch(/recover|guarantee|récupér|garanti/iu);
  });
});

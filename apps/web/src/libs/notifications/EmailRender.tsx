import { notificationCatalog } from '@celia/core';
import type { NotificationType } from '@celia/core';
import { render } from '@react-email/render';
import { createTranslator } from 'next-intl';
import { EmailLayout } from '@/components/email/EmailLayout';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';
import { notificationPath } from '@/utils/notifications/NotificationLink';

const messages = { en, fr };

export type RenderedEmail = { subject: string; html: string; text: string };

/**
 * Writes one notification as an email in the person's language. It takes everything it needs as arguments, with no request
 * and no session, because it runs in the worker. The email carries no claim detail, only a short message and a link into the
 * signed-in app.
 * @param options - What to write.
 * @param options.type - The notification type.
 * @param options.locale - The language, `en` or `fr`.
 * @param options.data - The ids the notification carries, for the link.
 * @param options.unsubscribeUrl - The one-click unsubscribe link, for optional updates.
 * @returns The subject, the HTML and the plain text.
 */
export async function renderNotification(options: {
  type: NotificationType;
  locale: string;
  data: Record<string, string>;
  unsubscribeUrl?: string;
}): Promise<RenderedEmail> {
  const locale = options.locale === 'fr' ? 'fr' : 'en';
  const t = createTranslator({ locale, messages: messages[locale], namespace: 'Email' });
  const { essential } = notificationCatalog[options.type];
  const base = getBaseUrl();
  const url = `${base}${getI18nPath(notificationPath(options.type, options.data), locale)}`;

  const element = (
    <EmailLayout
      lang={locale}
      preview={t(`${options.type}_preview`)}
      heading={t(`${options.type}_heading`)}
      body={t(`${options.type}_body`)}
      action={t(`${options.type}_action`)}
      url={url}
      footer={{
        reason: essential ? t('footer_account') : t('footer_updates'),
        manage: essential
          ? undefined
          : {
              label: t('footer_manage'),
              url: `${base}${getI18nPath('/dashboard/settings', locale)}`,
            },
        unsubscribe:
          essential || !options.unsubscribeUrl
            ? undefined
            : { label: t('footer_unsubscribe'), url: options.unsubscribeUrl },
      }}
    />
  );

  return {
    subject: t(`${options.type}_subject`),
    html: await render(element),
    text: await render(element, { plainText: true }),
  };
}

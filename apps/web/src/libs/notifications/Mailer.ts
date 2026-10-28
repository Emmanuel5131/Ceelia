import { createTransport } from 'nodemailer';
import { Env } from '@/libs/Env';

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Stable per message, so a retry carries the same `Message-ID`. */
  messageId: string;
  /** For optional updates: the one-click unsubscribe URL. */
  unsubscribeUrl?: string;
};

const production = Env.NODE_ENV === 'production';

/**
 * The sender, as set in the environment. Production must set it; development falls back to a local address.
 * @returns The `From` value.
 */
function sender() {
  if (Env.MAIL_FROM) {
    return Env.MAIL_FROM;
  }

  if (production) {
    throw new Error('MAIL_FROM is not set');
  }

  return 'Celia <notifications@localhost>';
}

/**
 * The domain part of the sender, used for `Message-ID`s so they match the domain mail is signed for.
 * @returns The domain.
 */
export function senderDomain() {
  return sender().split('@').pop()?.replace('>', '').trim() ?? 'localhost';
}

let transport: ReturnType<typeof createTransport> | undefined;

/**
 * The connection to the mail server: our own server in production, set by `SMTP_*`, or a local catcher such as Mailpit in
 * development. Connections are pooled and reused between messages. The settings are the only thing that ties Celia to a mail
 * server, so a relay can replace it by changing them.
 * @returns The transport.
 */
function getTransport() {
  if (transport) {
    return transport;
  }

  if (production && !Env.SMTP_HOST) {
    throw new Error('SMTP_HOST is not set');
  }

  const secure = Env.SMTP_SECURE === 'true';
  transport = createTransport({
    host: Env.SMTP_HOST ?? 'localhost',
    port: Env.SMTP_PORT ?? (Env.SMTP_HOST ? 587 : 1025),
    secure,
    // In production the connection must be encrypted; nodemailer refuses to send in the clear.
    requireTLS: production && !secure,
    auth: Env.SMTP_USER ? { user: Env.SMTP_USER, pass: Env.SMTP_PASSWORD } : undefined,
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
  });

  return transport;
}

/**
 * Sends one email. Mail is marked as automatic so out-of-office replies do not answer it, and optional updates carry the
 * one-click unsubscribe headers that Gmail and Yahoo expect (RFC 8058). It throws when the server refuses or cannot be
 * reached; the caller decides whether to retry.
 * @param message - The message.
 */
export async function sendMail(message: MailMessage) {
  await getTransport().sendMail({
    from: sender(),
    replyTo: Env.MAIL_REPLY_TO,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    messageId: message.messageId,
    headers: {
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All',
      ...(message.unsubscribeUrl
        ? {
            'List-Unsubscribe': `<${message.unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          }
        : {}),
    },
  });
}

/**
 * Closes the pooled connections. Only needed when a process wants to exit cleanly, such as a test.
 */
export function closeMailer() {
  transport?.close();
  transport = undefined;
}

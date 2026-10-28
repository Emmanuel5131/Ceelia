import { once } from 'node:events';
import { promisify } from 'node:util';
import { classifyFailure, toMailError } from '@celia/core';
import { SMTPServer } from 'smtp-server';
import type { SMTPServerAddress } from 'smtp-server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type * as MailerModule from './Mailer';

// A real SMTP server on a free local port stands in for the mail server: no mocks, so what is checked is what goes on the wire.
describe('Mailer', () => {
  const received: string[] = [];
  let server: SMTPServer;
  let mailer: typeof MailerModule;

  const base = {
    to: 'person@example.org',
    subject: 'Your claim was sent',
    html: '<p>Hello</p>',
    text: 'Hello',
    messageId: '<message-1@mail.example.org>',
  };

  // What the mail server answers when sending to this address.
  const failureOf = async (to: string) => {
    try {
      await mailer.sendMail({ ...base, to });
    } catch (error) {
      return classifyFailure(toMailError(error));
    }

    return 'sent';
  };

  beforeAll(async () => {
    server = new SMTPServer({
      authOptional: true,
      disabledCommands: ['STARTTLS'],
      onRcptTo(address: SMTPServerAddress, _session, done) {
        if (address.address.startsWith('busy')) {
          done(Object.assign(new Error('4.7.1 try later'), { responseCode: 451 }));
        } else if (address.address.startsWith('nobody')) {
          done(Object.assign(new Error('5.1.1 no such user'), { responseCode: 550 }));
        } else {
          done();
        }
      },
      onData(stream, _session, done) {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => {
          received.push(Buffer.concat(chunks).toString());
          done();
        });
      },
    });
    server.listen(0, '127.0.0.1');
    await once(server.server, 'listening');
    const address = server.server.address();
    vi.stubEnv('SMTP_HOST', '127.0.0.1');
    vi.stubEnv('SMTP_PORT', String(typeof address === 'object' && address ? address.port : 0));
    vi.stubEnv('MAIL_FROM', 'Celia <notifications@mail.example.org>');
    vi.resetModules();
    mailer = await import('./Mailer');
  });

  afterAll(async () => {
    mailer.closeMailer();
    await promisify(server.close.bind(server))();
    vi.unstubAllEnvs();
  });

  it('sends an automatic message with a stable message id', async () => {
    await mailer.sendMail(base);
    const raw = received.at(-1) ?? '';

    expect(raw).toContain('Message-ID: <message-1@mail.example.org>');
    expect(raw).toContain('Auto-Submitted: auto-generated');
    expect(raw).toContain('From: Celia <notifications@mail.example.org>');
    expect(raw).not.toContain('List-Unsubscribe');
  });

  it('adds one-click unsubscribe headers to an optional update', async () => {
    await mailer.sendMail({
      ...base,
      unsubscribeUrl: 'https://example.org/api/unsubscribe?token=t',
    });
    const raw = received.at(-1) ?? '';

    expect(raw).toContain('List-Unsubscribe: <https://example.org/api/unsubscribe?token=t>');
    expect(raw).toContain('List-Unsubscribe-Post: List-Unsubscribe=One-Click');
  });

  it('sends both an HTML and a plain-text part', async () => {
    await mailer.sendMail(base);
    const raw = received.at(-1) ?? '';

    expect(raw).toContain('text/plain');
    expect(raw).toContain('text/html');
  });

  it('fails in a way that is worth retrying when the server says to try later', async () => {
    await expect(failureOf('busy@example.org')).resolves.toBe('retry');
  });

  it('fails as a bounce when the mailbox does not exist', async () => {
    await expect(failureOf('nobody@example.org')).resolves.toBe('bounce');
  });
});

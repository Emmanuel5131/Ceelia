# Mail and notifications: setup and operations

How Celia sends email and shows notifications, and what has to be done outside the code to make it work in production. The design reasons are in the plan this was built from; this file is what an operator needs.

## How it works

1. A server action changes something (a claim is sent, a lawyer is verified, a case is taken) and calls `notify()` in the same database transaction. That writes a **notification** (shown in the app) and, if the person should get one, an **email_message** row in the outbox.
2. A scheduler calls `GET /api/notifications/drain` every minute. The worker claims due rows (`FOR UPDATE SKIP LOCKED`), reads the person's current address from Clerk, skips suppressed addresses, writes the email in their saved language, and sends it over SMTP.
3. A failed send is retried with backoff (10 minutes, doubling, capped at 6 hours, 8 tries). A refused mailbox (`5.1.1`) stops the message and suppresses the address.
4. The mail server reports bounces and complaints to `POST /api/webhooks/mail`, which suppresses the address.

Emails carry no claim detail: no statement, wallet, platform or amount. They say that something changed and link to the signed-in app. There is no open or click tracking, and there must never be: a victim's mailbox may be shared or compromised.

Delivery is **at-least-once**. SMTP has no idempotency key. Each message has a stable `Message-ID` derived from its outbox row, and the only way to get a duplicate is a crash after the mail server accepted the message but before the row was marked sent.

## Settings

All read in `apps/web/src/libs/Env.ts`. Put secrets in `.env.local` (development) or the host's secret store (production), never in a committed file.

| Variable | Needed | What it is |
|---|---|---|
| `SMTP_HOST`, `SMTP_PORT` | production | The mail server. Development defaults to `localhost:1025` (Mailpit) |
| `SMTP_USER`, `SMTP_PASSWORD` | production | Submission login |
| `SMTP_SECURE` | optional | `true` for implicit TLS (port 465). Otherwise STARTTLS is required in production |
| `MAIL_FROM` | production | For example `Celia <notifications@mail.example.org>`. The domain must be the one you sign mail for |
| `MAIL_REPLY_TO` | optional | Where replies go |
| `MAIL_WARMUP_START` | while warming up | The day sending began, `2026-11-01`. Turns on the warm-up ramp (50 a day, +25% a day) |
| `MAIL_DAILY_LIMIT` | optional | Daily ceiling, default 2000. Also caps sending when warm-up is off |
| `CRON_SECRET` | production | At least 16 characters. The scheduler sends it as `Authorization: Bearer <secret>` |
| `UNSUBSCRIBE_SECRET` | production | At least 32 characters. Signs unsubscribe links. Without it, optional emails go without an unsubscribe link |
| `MAIL_WEBHOOK_SECRET` | production | At least 16 characters. Authenticates bounce and complaint reports |

Generate each secret with `openssl rand -base64 32`. Production refuses to send if `SMTP_HOST` or `MAIL_FROM` is missing.

## Development

Install a local mail catcher and open its inbox in the browser: `brew install mailpit`, then run `mailpit` (SMTP on `1025`, inbox at http://localhost:8025). With no `SMTP_*` set, Celia sends there, and Mailpit keeps mail for any recipient, so nothing reaches a real address.

Set `CRON_SECRET` (at least 16 characters) and `UNSUBSCRIBE_SECRET` (at least 32) in `.env.local`; `openssl rand -hex 32` makes one. Without `CRON_SECRET` the send route answers 401 to everyone, and without `UNSUBSCRIBE_SECRET` optional emails carry no unsubscribe link.

`pnpm dev` also runs `scripts/drain-dev.ts`, which calls the send route every ten seconds, so mail queued by an action reaches the inbox on its own. To send by hand instead:

```
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/notifications/drain
```

Seeded data is written straight to the database and sends nothing. To see mail, act in the app: send a claim, confirm a wallet, or verify a lawyer as staff.

## The mail server (production)

**Recommended: Postal** (`postalserver/postal`), a self-hosted mail platform built for applications: SMTP and an HTTP API, per-domain DKIM, bounce handling and webhooks. Alternatives: Stalwart (all-in-one, AGPL, also gives mailboxes), Mox (MIT, single binary). Celia only needs SMTP submission, so any of them, or a relay, works by changing the `SMTP_*` settings.

A serverless host cannot run a mail server: it needs a machine of its own.

Do not skip any of this:

- **A dedicated VM**, about 4 GB of RAM for Postal (it needs MariaDB 10.6 or newer; check Postal's own prerequisites page before sizing), with a **static IPv4**.
- **Outbound port 25 open.** Many hosts and AWS block it by default. Get it opened in writing before you build anything: `nc -vz gmail-smtp-in.l.google.com 25` from the server must connect.
- **Reverse DNS (PTR)** for the IP, equal to the server's HELO name. A missing or generic PTR is an immediate strike.
- **A sending subdomain**, for example `mail.<domain>`, with:
  - **SPF** listing the server's IP.
  - **DKIM**, a key per domain (Postal generates it).
  - **DMARC** at `p=none` with a `rua` report address at first, moving to `quarantine` once reports are clean.
  - **MTA-STS** and **TLS-RPT** records.
- **Submission** (587, or 465) open only to the app's outbound IPs, with a login for Celia.
- **Check the IP against blocklists** (Spamhaus and others) before using it. A reused IP may already be listed; ask the host to replace it.
- **Backups, patching, disk and queue monitoring.** A mail server that fills its disk stops silently.
- **Disable open and click tracking** in Postal for the Celia server.

### Warm-up

A new IP and domain have no reputation, and large providers throttle or block a sudden volume. Set `MAIL_WARMUP_START` to the first sending day. The worker then allows 50 emails on day one, growing 25% a day (about 1,100 after two weeks and 25,000 after four), never above `MAIL_DAILY_LIMIT`. Emails over the limit wait in the outbox for tomorrow. Watch Google Postmaster Tools and complaint rates (keep complaints under 0.1%) and do not raise the ceiling while delivery is poor.

### Break-glass

If the IP is blocklisted and mail stops arriving, point `SMTP_*` at a relay (Amazon SES, a Resend SMTP login) and redeploy. No code changes. Move back once the IP is clean.

## The scheduler

Anything that sends `GET /api/notifications/drain` with `Authorization: Bearer $CRON_SECRET` every minute works:

- **Vercel**: a Cron Job in `vercel.json` for that path; Vercel sends the `CRON_SECRET` environment variable as the bearer token automatically.
- **Anywhere else**: a system cron on the mail VM, `* * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://<app>/api/notifications/drain`.

Each run sends up to 50 messages, so a minute schedule is 3,000 an hour, above any warm-up limit. Two overlapping runs are safe.

## Bounces and complaints

`POST /api/webhooks/mail` accepts only our own small format, so the app does not depend on which mail server runs:

```json
{ "type": "hard_bounce", "email": "someone@example.org" }
```

`type` is `hard_bounce` or `complaint`. Authenticate with `Authorization: Bearer <MAIL_WEBHOOK_SECRET>`. Each report suppresses the address: nothing is mailed to it again until staff allow it on the staff page.

**Still to do at deployment:** translate the mail server's own webhook payload into that format. Postal posts its own event shapes and signs them differently; read Postal's webhook documentation (I could not confirm the payload or the signature scheme from public pages) and put a small adapter in front of the route, or add a route for it that verifies Postal's signature and calls `suppress()` from `libs/notifications/Suppression.ts`. This is required before real sending, not optional. Celia hands each message to the mail server, which accepts it and then delivers it to the recipient's provider, so a bounce comes back to Celia later and only through this route. The `5.1.1` check in the worker only catches a refusal that the server returns while Celia is still connected, which a relay does not do. Without the adapter, bounced and complaining addresses keep being mailed, which damages the sending reputation.

## After the first deploy

1. Apply the migrations (`0003` cases, `0004` notifications).
2. Sign in as staff and press **Sync from Clerk** on the staff page. Lawyers who signed up before the notification tables existed are not in our copy of the lawyer list until you do.
3. Send a test through each kind of event with your own accounts and read the headers in Gmail and Outlook (`Authentication-Results` must show `spf=pass`, `dkim=pass`, `dmarc=pass`). Check a mail-tester score.
4. Watch the staff **Mail** panel: waiting, failed and stopped addresses. A growing "waiting" count with nothing sent means the scheduler or the SMTP login is broken; failed emails show the reason, and **Try again** puts one back once it is fixed.

## Privacy and copy rules for email

- No claim detail, wallet, platform name, amount or firm name in any email. Links go to the signed-in app.
- No outcome, recovery, timeline or fee promises, no "scam", no exclamation marks. Run any new email copy through the copy reviewer.
- Account and registration notices (`counsel_received`, `counsel_verified`, `counsel_review_reset`) and the confirmation of taking a case always send. Everything else follows the person's choice in Settings, and carries a one-click unsubscribe.
- Emails are written in the language the person last used (saved when they act, or change language, while signed in). Anyone with no saved language gets English.
- Sent-message records, including the address mail went to, are deleted after 90 days.

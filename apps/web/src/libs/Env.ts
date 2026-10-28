import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const Env = createEnv({
  server: {
    ARCJET_KEY: z.string().startsWith('ajkey_').optional(),
    CLERK_SECRET_KEY: z.string().min(1),
    /** The Idswyft key. With it, a person must pass the one-time identity check before reporting a loss; without it there is no check. */
    IDSWYFT_API_KEY: z.string().min(1).optional(),
    /** `true` to use Idswyft's sandbox, which accepts test documents. */
    IDSWYFT_SANDBOX: z.enum(['true', 'false']).optional(),
    DATABASE_URL: z.string().min(1),
    /** The mail server. Optional in development, where mail goes to a local catcher; required in production. */
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    /** `true` for implicit TLS (port 465); otherwise the connection upgrades with STARTTLS. */
    SMTP_SECURE: z.enum(['true', 'false']).optional(),
    /** The sender shown to people, such as `Celia <notifications@mail.example.org>`. */
    MAIL_FROM: z.string().optional(),
    MAIL_REPLY_TO: z.string().optional(),
    /** The day sending began, as `2026-11-01`. Turns on the warm-up limit. */
    MAIL_WARMUP_START: z.iso.date().optional(),
    /** The most emails to send in one day once warmed up. */
    MAIL_DAILY_LIMIT: z.coerce.number().int().positive().default(2000),
    /** The bearer secret the scheduler sends to the drain route. */
    CRON_SECRET: z.string().min(16).optional(),
    /** Signs unsubscribe links. */
    UNSUBSCRIBE_SECRET: z.string().min(32).optional(),
    /** Verifies the mail server's bounce and complaint webhooks. */
    MAIL_WEBHOOK_SECRET: z.string().min(16).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_LOGGING_LEVEL: z
      .enum(['error', 'info', 'debug', 'warning', 'trace', 'fatal'])
      .default('info'),
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().optional(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    ARCJET_KEY: process.env.ARCJET_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    IDSWYFT_API_KEY: process.env.IDSWYFT_API_KEY,
    IDSWYFT_SANDBOX: process.env.IDSWYFT_SANDBOX,
    DATABASE_URL: process.env.DATABASE_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_SECURE: process.env.SMTP_SECURE,
    MAIL_FROM: process.env.MAIL_FROM,
    MAIL_REPLY_TO: process.env.MAIL_REPLY_TO,
    MAIL_WARMUP_START: process.env.MAIL_WARMUP_START,
    MAIL_DAILY_LIMIT: process.env.MAIL_DAILY_LIMIT,
    CRON_SECRET: process.env.CRON_SECRET,
    UNSUBSCRIBE_SECRET: process.env.UNSUBSCRIBE_SECRET,
    MAIL_WEBHOOK_SECRET: process.env.MAIL_WEBHOOK_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_LOGGING_LEVEL: process.env.NEXT_PUBLIC_LOGGING_LEVEL,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NODE_ENV: process.env.NODE_ENV,
  },
});

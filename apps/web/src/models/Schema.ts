import type {
  AccountKind,
  ChainId,
  ContactChannel,
  FraudType,
  NotificationType,
  OptionalCategory,
  PaymentMethod,
  WalletApp,
  WalletType,
} from '@celia/core';
import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import type { CaseStatus } from '@/utils/Case';
import type { Report } from '@/validations/ReportValidation';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// It automatically run the command `db-server:file`, which apply the migration before Next.js starts in development mode,
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://get.neon.com/BMFYNtx
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * One person's claim: a wallet that lost money to one platform, and what they say happened. Claims for the same platform
 * (`platformKey`) are pooled into a case later. The statement and the link between a person and a wallet are private: they
 * are shown only to that person and, once a case is taken, to the counsel handling it.
 */
export const claimSchema = pgTable(
  'claim',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    /** The Clerk user id of the person who filed the claim. */
    userId: text('user_id').notNull(),
    /** What kind of loss this is, in a victim's words. See `fraudTypes` in `@celia/core`. */
    fraudType: text('fraud_type').$type<FraudType>().notNull().default('other'),
    /** Every kind of loss the person says fits, the first being `fraudType`. A case can fit more than one. */
    fraudTypes: text('fraud_types').array().$type<FraudType[]>().notNull().default([]),
    /** How the money left: their own wallet, an exchange account, a crypto ATM, or a peer-to-peer purchase. */
    paymentMethod: text('payment_method').$type<PaymentMethod>().notNull().default('wallet'),
    /** The chain, as an id from `@celia/core`: `ethereum`, `tron`, `solana`, and so on. */
    chain: text('chain').$type<ChainId>().notNull(),
    /** Their own wallet, when they paid from one. Empty for exchange, ATM and peer-to-peer payments. */
    walletAddress: text('wallet_address'),
    /** The transaction that sent the money. Required when there is no wallet to sign with. */
    txHash: text('tx_hash'),
    /** Who took the money. Empty when they do not know. */
    platformName: text('platform_name'),
    /** The name reduced to letters and digits, so spellings of one name pool together. */
    platformKey: text('platform_key'),
    platformUrl: text('platform_url'),
    /** The website's host without `www.`, so two claims naming the same site pool together. */
    platformHost: text('platform_host'),
    /** A Telegram, X or other handle the operator used. */
    operatorHandle: text('operator_handle'),
    /** The token contract, for a rug pull. Lowercased so spellings match. */
    tokenContract: text('token_contract'),
    /** The token or NFT's name and symbol, in the person's own words, such as "Moon Inu (MINU)". */
    tokenName: text('token_name'),
    /** The kind of wallet the money left from, when it was their own. */
    walletType: text('wallet_type').$type<WalletType>(),
    /** What kind of account the wallet is on its chain, read from the chain when the claim was filed. Empty when it could not be. */
    accountKind: text('account_kind').$type<AccountKind>(),
    /** The named wallet, such as MetaMask or Phantom, when they said. */
    walletApp: text('wallet_app').$type<WalletApp>(),
    /** The transaction that first funded the wallet, when they gave it. It lets us trace where the money came from. */
    fundingTxHash: text('funding_tx_hash'),
    /** The address they sent the money to, such as the platform's deposit address, when they have it. It lets us follow the money. */
    destinationAddress: text('destination_address'),
    /** When they first and last paid, as `YYYY-MM-DD`. It gives the case a timeline. */
    firstPaymentOn: date('first_payment_on', { mode: 'string' }),
    lastPaymentOn: date('last_payment_on', { mode: 'string' }),
    /** What they sent, in their own words, such as USDT or ETH. */
    assetSent: text('asset_sent'),
    contactChannel: text('contact_channel').$type<ContactChannel>(),
    /** What they say they lost, in their own words. Not confirmed: the chain works out the real figure. */
    amountLost: text('amount_lost'),
    /** What they were promised, by whom and where, and what happened, in their own words. Not confirmed by the chain. */
    statement: text('statement'),
    country: text('country'),
    /** `unsigned` until a signed message from the wallet has been checked. */
    ownership: text('ownership').notNull().default('unsigned'),
    /** The one-time value in the message to sign, so a signature cannot be reused for another claim. */
    nonce: text('nonce').notNull(),
    signature: text('signature'),
    signedAt: timestamp('signed_at', { mode: 'date' }),
    /** `draft` while the person is still filling it in, `submitted` once they send it. */
    status: text('status').notNull().default('draft'),
    submittedAt: timestamp('submitted_at', { mode: 'date' }),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    unique('claim_one_wallet_per_platform').on(
      table.userId,
      table.chain,
      table.walletAddress,
      table.platformKey,
    ),
  ],
);

/**
 * A case: the claims against one platform, pooled. The case bank shows the summary to everyone. The platform name here is
 * what Celia calls it until the platform consents to being named. `platformKey` matches the claims that belong to it, so the
 * number of claimants is counted, never stored.
 */
export const caseSchema = pgTable('case', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** The running number shown as `CB-0142`. */
  seq: serial('seq').notNull().unique(),
  name: text('name').notNull(),
  /** The same reduced name the claims carry in `claim.platform_key`. */
  platformKey: text('platform_key').notNull().unique(),
  /** A jurisdiction id from `@celia/jurisdictions`. */
  jurisdiction: text('jurisdiction').notNull(),
  /** One line on the case, such as the wallets affected and the estimated loss. Written when a report is saved. */
  description: text('description'),
  /** `collecting`, `building`, `sealed` or `counsel`. Moves forward only; staff set the first three, taking a case sets the last. */
  status: text('status').$type<CaseStatus>().notNull().default('collecting'),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * The lawyers working a case. For now a firm is its lead lawyer: one `lead` row per case, which the unique index below
 * enforces, so two firms cannot take the same case even at the same moment. `member` rows are for colleagues, added later.
 */
export const caseTeamSchema = pgTable(
  'case_team',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => caseSchema.id),
    /** The Clerk user id of the lawyer. */
    userId: text('user_id').notNull(),
    role: text('role').$type<'lead' | 'member'>().notNull(),
    /** When the lawyer confirmed their firm checked conflicts for this case. */
    conflictsConfirmedAt: timestamp('conflicts_confirmed_at', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    unique('case_team_one_row_per_lawyer').on(table.caseId, table.userId),
    uniqueIndex('case_team_one_lead')
      .on(table.caseId)
      .where(sql`${table.role} = 'lead'`),
  ],
);

/**
 * One thing that happened to one person, shown in their notifications inside the app. `data` holds ids and nothing else, so no
 * claim detail is copied here; the page reads the claim or case itself. `dedupeKey` makes a repeated action write one row.
 */
export const notificationSchema = pgTable(
  'notification',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    /** The Clerk user id of the person it is for. */
    userId: text('user_id').notNull(),
    type: text('type').$type<NotificationType>().notNull(),
    data: jsonb('data').$type<Record<string, string>>().notNull().default({}),
    dedupeKey: text('dedupe_key').notNull(),
    readAt: timestamp('read_at', { mode: 'date', withTimezone: true }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('notification_one_per_event').on(table.userId, table.dedupeKey),
    index('notification_by_user').on(table.userId, table.createdAt),
  ],
);

export type EmailStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'suppressed' | 'cancelled';

/**
 * The outbox: one row per email to send. It is written in the same transaction as the event that caused it, so an email is
 * never lost and never sent for something that rolled back. A worker claims `pending` rows that are due. The address is not
 * stored: it is read from Clerk when the message is sent, so a changed address is respected.
 */
export const emailMessageSchema = pgTable(
  'email_message',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    notificationId: uuid('notification_id')
      .notNull()
      .references(() => notificationSchema.id),
    userId: text('user_id').notNull(),
    type: text('type').$type<NotificationType>().notNull(),
    /** The person's language when the event happened, so the email is written in it. */
    locale: text('locale').notNull(),
    status: text('status').$type<EmailStatus>().notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    nextAttemptAt: timestamp('next_attempt_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    /** Set while a worker holds the row, so a crashed worker's rows can be found and released. */
    lockedAt: timestamp('locked_at', { mode: 'date', withTimezone: true }),
    lastError: text('last_error'),
    /** The address the message went to, kept only once sent, for matching bounces. */
    sentTo: text('sent_to'),
    sentAt: timestamp('sent_at', { mode: 'date', withTimezone: true }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('email_message_one_per_notification').on(table.notificationId),
    index('email_message_due').on(table.status, table.nextAttemptAt),
  ],
);

/** Addresses we must not mail: ones that bounced or complained. Checked before every send. */
export const emailSuppressionSchema = pgTable('email_suppression', {
  /** Lowercase. */
  email: text('email').primaryKey(),
  reason: text('reason').$type<'bounce' | 'complaint' | 'manual'>().notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
});

/** Settings that belong to a person but are not in Clerk. For now only the language their emails are written in. */
export const userSettingSchema = pgTable('user_setting', {
  userId: text('user_id').primaryKey(),
  locale: text('locale').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/** Which optional categories of email a person has chosen. A missing row means on. Account notices ignore this. */
export const notificationPreferenceSchema = pgTable(
  'notification_preference',
  {
    userId: text('user_id').notNull(),
    category: text('category').$type<OptionalCategory>().notNull(),
    email: boolean('email').notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [unique('notification_preference_one_per_category').on(table.userId, table.category)],
);

/**
 * A copy of what Clerk holds about a lawyer that we need to search on: who is verified and where they are admitted. Clerk
 * metadata cannot be queried, so without this we could not find the lawyers a sealed case is ready for. Clerk stays the source
 * of truth; this is written next to every Clerk write.
 */
export const counselProfileSchema = pgTable('counsel_profile', {
  userId: text('user_id').primaryKey(),
  review: text('review').$type<'pending' | 'verified'>().notNull(),
  firm: text('firm'),
  jurisdictions: jsonb('jurisdictions').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * The findings of an analysis of a case, frozen as a record. A case may have several versions as the analysis is redone; the
 * newest is the one shown. `snapshot` is public-facts-only JSON checked by `ReportValidation`, and `hash` is its SHA-256, so
 * a changed snapshot no longer matches the hash shown with it.
 */
export const caseReportSchema = pgTable(
  'case_report',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => caseSchema.id),
    version: integer('version').notNull(),
    snapshot: jsonb('snapshot').$type<Report>().notNull(),
    hash: text('hash').notNull(),
    /** The staff member who saved it. */
    savedBy: text('saved_by').notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique('case_report_one_per_version').on(table.caseId, table.version)],
);

export type CaseEventType =
  | 'case_opened'
  | 'claim_added'
  | 'report_saved'
  | 'case_sealed'
  | 'case_taken';

/**
 * What happened to a case and when: it was opened, claims were added, a report was saved, the evidence was sealed, a firm took
 * it. The overview's activity feed and its "sealed this month" count read this. It holds no names and no claim detail, only the
 * case and the kind of event, so it is safe to show to any lawyer who can see the case.
 */
export const caseEventSchema = pgTable(
  'case_event',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => caseSchema.id),
    type: text('type').$type<CaseEventType>().notNull(),
    /** How many things the event covers, such as claims added at once. */
    count: integer('count').notNull().default(1),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('case_event_recent').on(table.createdAt)],
);

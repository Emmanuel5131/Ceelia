import type { ChainId, ContactChannel, FraudType, PaymentMethod } from '@celia/core';
import { integer, pgTable, serial, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

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

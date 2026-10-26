import type { ChainFamily } from '@celia/core';
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
    /** The chain family: `evm`, `solana`, `tron`, `bitcoin` or `other`. */
    chain: text('chain').$type<ChainFamily>().notNull(),
    walletAddress: text('wallet_address').notNull(),
    platformName: text('platform_name').notNull(),
    /** The platform's name reduced to letters and digits, so spellings of one name pool together. */
    platformKey: text('platform_key').notNull(),
    platformUrl: text('platform_url'),
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

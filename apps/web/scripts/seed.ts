import { randomUUID } from 'node:crypto';
import { platformKey } from '@celia/core';
import type { ChainId, ContactChannel, FraudType, PaymentMethod } from '@celia/core';
import { getJurisdiction } from '@celia/jurisdictions';
import { inArray, like, sql } from 'drizzle-orm';
import { Env } from '@/libs/Env';
import {
  caseEventSchema,
  caseReportSchema,
  caseSchema,
  caseTeamSchema,
  claimSchema,
} from '@/models/Schema';
import type { CaseEventType } from '@/models/Schema';
import type { CaseStatus } from '@/utils/Case';
import { createDbConnection } from '@/utils/DBConnection';
import { describeCase, hashReport } from '@/utils/Report';
import { ReportValidation } from '@/validations/ReportValidation';

/**
 * Fills the local database with sample cases, claims, reports and activity. Sample rows are recognisable: claimants are
 * `seed_user_*` and platforms are `Platform <Colour> <Animal>`. Running it again replaces the sample rows and touches nothing
 * else. It refuses to run against a database that is not on this machine.
 */
const CASES = 1000;
const CLAIMANTS = 4000;
const DAY = 86_400_000;

const colours = [
  'Amber',
  'Azure',
  'Beige',
  'Bronze',
  'Cobalt',
  'Coral',
  'Crimson',
  'Cyan',
  'Emerald',
  'Gold',
  'Grey',
  'Indigo',
  'Ivory',
  'Jade',
  'Lilac',
  'Lime',
  'Magenta',
  'Maroon',
  'Navy',
  'Olive',
  'Orange',
  'Peach',
  'Plum',
  'Rose',
  'Ruby',
  'Sage',
  'Scarlet',
  'Silver',
  'Teal',
  'Violet',
  'Amethyst',
  'Auburn',
  'Copper',
  'Ebony',
  'Fuchsia',
  'Hazel',
  'Mauve',
  'Ochre',
  'Saffron',
  'Umber',
];

const animals = [
  'Badger',
  'Bison',
  'Crane',
  'Dolphin',
  'Eagle',
  'Falcon',
  'Ferret',
  'Fox',
  'Gecko',
  'Heron',
  'Hyena',
  'Ibis',
  'Jackal',
  'Koala',
  'Lemur',
  'Lynx',
  'Marten',
  'Mink',
  'Newt',
  'Ocelot',
  'Osprey',
  'Otter',
  'Panda',
  'Puma',
  'Raven',
  'Seal',
  'Stork',
  'Tapir',
  'Viper',
  'Wombat',
  'Alpaca',
  'Beaver',
  'Condor',
  'Dingo',
  'Egret',
  'Gazelle',
  'Impala',
  'Kestrel',
  'Narwhal',
  'Quokka',
];

const jurisdictions = [
  'ng',
  'ng',
  'ng',
  'ke',
  'ke',
  'za',
  'za',
  'gh',
  'ug',
  'tz',
  'us',
  'us',
  'ca',
  'br',
  'br',
  'mx',
  'co',
  'ph',
  'in',
  'id',
];

const chains: { id: ChainId; weight: number }[] = [
  { id: 'ethereum', weight: 5 },
  { id: 'bsc', weight: 4 },
  { id: 'tron', weight: 5 },
  { id: 'solana', weight: 3 },
  { id: 'polygon', weight: 2 },
  { id: 'base', weight: 1 },
  { id: 'arbitrum', weight: 1 },
];

const fraudTypes: FraudType[] = [
  'investment_platform',
  'investment_platform',
  'rug_pull',
  'exchange_service',
  'impersonation',
  'recovery_scam',
  'wallet_drained',
  'address_poisoning',
  'honeypot_token',
  'extortion',
  'fake_job',
  'account_takeover',
  'other',
];

const contactChannels: ContactChannel[] = [
  'social_dating',
  'messaging',
  'ad_influencer',
  'referral',
  'call_text_email',
  'search',
  'other',
];

const statements = [
  'I was added to a group chat where members posted daily payouts. I sent funds to join and could not withdraw afterwards.',
  'A contact I met online introduced the platform and showed me a balance that kept growing. When I asked to withdraw I was told to pay a fee first.',
  'The site promised a fixed weekly return. The first two withdrawals worked, then the account was locked.',
  'I followed an advert from a well-known account and connected my wallet. The token could not be sold after I bought it.',
  'Someone offered to recover money I had already lost and asked for a deposit to start. They stopped replying after I paid.',
  'I approved a transaction on a site that looked like the official one. My wallet was emptied a few minutes later.',
];

const withdrawalClaims = [
  'Withdrawals are always available.',
  'Returns are paid from trading profit.',
  'Funds are held in a separate reserve.',
  'The platform has been operating for several years.',
];

const base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** A small seeded random generator, so the same run gives the same data. */
function mulberry32(seed: number) {
  let state = seed;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const random = mulberry32(20_261_027);
const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)] as T;
const chars = (alphabet: string, length: number) =>
  Array.from({ length }, () => alphabet[int(0, alphabet.length - 1)]).join('');
const hex = (length: number) => chars('0123456789abcdef', length);

function wallet(chain: ChainId) {
  if (chain === 'tron') {
    return `T${chars(base58, 33)}`;
  }

  if (chain === 'solana') {
    return chars(base58, 44);
  }

  return `0x${hex(40)}`;
}

function pickChain() {
  const total = chains.reduce((sum, chain) => sum + chain.weight, 0);
  let roll = random() * total;

  for (const chain of chains) {
    roll -= chain.weight;

    if (roll < 0) {
      return chain.id;
    }
  }

  return 'ethereum';
}

const money = (value: number) => `$${value.toLocaleString('en-US')}`;

/** A findings report in the house language, with tests whose figures agree with each other. */
function buildReport(options: { wallets: number; opened: number }) {
  const received = int(40, 900) * 1000;
  const outgoing = int(0, 6);
  const dataAsOf = new Date(options.opened).toISOString();

  return ReportValidation.parse({
    version: 1,
    headline: `The chain shows ${options.wallets} wallets sending funds to the same address. It does not show intent.`,
    estimate: { wallets: String(options.wallets), losses: money(received) },
    figures: [
      {
        label: 'Wallets affected',
        value: String(options.wallets),
        note: 'that sent funds to the platform',
      },
      {
        label: 'Estimated lost to this platform',
        value: money(received),
        note: 'sent to the platform address',
      },
    ],
    checks: withdrawalClaims.map((claim, index) => ({
      claim,
      evidence:
        index === 0
          ? 'Outgoing transfers to users fall to zero and stay there for the rest of the period read.'
          : 'The chain data read does not settle this.',
      result: index === 0 ? 'proven' : 'not_checkable',
      tests: index === 0 ? ['withdrawals-by-week'] : ['funding-sources'],
    })),
    tests: [
      {
        id: 'withdrawals-by-week',
        title: 'Withdrawals by week',
        summary: 'Outgoing transfers to users per week, counted from the first deposit.',
        columns: ['Week', 'Outgoing to users'],
        rows: [
          ['Week 1', String(int(10, 40))],
          ['Week 2', String(int(5, 20))],
          ['Week 3', String(outgoing)],
          ['Week 4', '0'],
        ],
      },
      {
        id: 'funding-sources',
        title: 'Funding sources',
        summary: 'Where the wallets that deposited got their funds.',
        columns: ['Source', 'Wallets'],
        rows: [
          ['Exchange withdrawals', String(Math.round(options.wallets * 0.7))],
          ['Other wallets', String(Math.round(options.wallets * 0.3))],
        ],
      },
    ],
    method: { commitment: `0x${hex(64)}` },
    dataAsOf,
    sources: ['Public chain data'],
  });
}

/** Whether the connection points at this machine. A seed must never run against a shared database. */
function isLocal(url: string) {
  return ['127.0.0.1', 'localhost', '::1'].includes(new URL(url).hostname);
}

if (!isLocal(Env.DATABASE_URL)) {
  throw new Error('Seeding only runs against a local database.');
}

for (const id of new Set(jurisdictions)) {
  if (!getJurisdiction(id)) {
    throw new Error(`Unknown jurisdiction: ${id}`);
  }
}

const db = createDbConnection();
const now = Date.now();

const names = colours
  .flatMap((colour) => animals.map((animal) => `Platform ${colour} ${animal}`))
  .toSorted(() => random() - 0.5)
  .slice(0, CASES);

const keyPattern = `^platform(${colours.join('|')})(${animals.join('|')})$`.toLowerCase();
const claimants = Array.from(
  { length: CLAIMANTS },
  (_, index) => `seed_user_${String(index + 1).padStart(4, '0')}`,
);

type EventRow = typeof caseEventSchema.$inferInsert;

const cases: (typeof caseSchema.$inferInsert)[] = [];
const claims: (typeof claimSchema.$inferInsert)[] = [];
const reports: (typeof caseReportSchema.$inferInsert)[] = [];
const events: EventRow[] = [];

for (const name of names) {
  const roll = random();
  const status: CaseStatus = roll < 0.45 ? 'collecting' : roll < 0.7 ? 'building' : 'sealed';
  const id = randomUUID();
  const key = platformKey(name);
  const opened = now - int(20, 200) * DAY;
  const jurisdiction = pick(jurisdictions);
  const size =
    status === 'collecting' ? int(1, 4) : status === 'building' ? int(3, 10) : int(6, 20);
  const event = (type: CaseEventType, at: number, count = 1) =>
    events.push({ caseId: id, type, count, createdAt: new Date(at) });

  event('case_opened', opened);

  const lastClaim = opened + int(1, 15) * DAY;
  const fraudType = pick(fraudTypes);
  const host = `${key.replace('platform', '')}.example`;
  const chosen = new Set<string>();

  while (chosen.size < size) {
    chosen.add(pick(claimants));
  }

  for (const userId of chosen) {
    const chain = pickChain();
    const submittedAt = new Date(opened + int(0, lastClaim - opened));
    const signed = random() < 0.7;

    claims.push({
      userId,
      fraudType,
      fraudTypes: [fraudType],
      paymentMethod: 'wallet' satisfies PaymentMethod,
      chain,
      walletAddress: wallet(chain),
      platformName: name,
      platformKey: key,
      platformUrl: `https://${host}`,
      platformHost: host,
      contactChannel: pick(contactChannels),
      amountLost: money(int(2, 400) * 50),
      statement: pick(statements),
      country: jurisdiction.toUpperCase(),
      ownership: signed ? 'signed' : 'unsigned',
      nonce: hex(32),
      signature: signed ? `0x${hex(130)}` : null,
      signedAt: signed ? submittedAt : null,
      status: 'submitted',
      submittedAt,
      createdAt: submittedAt,
      updatedAt: submittedAt,
    });
  }

  event('claim_added', lastClaim, size);

  let updated = lastClaim;
  let description: string | null = null;
  const reportCount =
    status === 'sealed' ? (random() < 0.2 ? 2 : 1) : status === 'building' ? int(0, 1) : 0;

  for (let version = 1; version <= reportCount; version++) {
    const savedAt = lastClaim + version * int(2, 10) * DAY;
    const snapshot = buildReport({ wallets: size * int(8, 30), opened: savedAt });

    description = describeCase(snapshot);
    reports.push({
      caseId: id,
      version,
      snapshot,
      hash: hashReport(snapshot),
      savedBy: 'seed_staff',
      createdAt: new Date(savedAt),
    });
    event('report_saved', savedAt);
    updated = savedAt;
  }

  if (status === 'sealed') {
    updated = Math.min(now - int(0, 60) * DAY, now);
    updated = Math.max(updated, lastClaim + 20 * DAY);
    event('case_sealed', Math.min(updated, now));
  }

  cases.push({
    id,
    name,
    platformKey: key,
    jurisdiction,
    description,
    status,
    createdAt: new Date(opened),
    updatedAt: new Date(Math.min(updated, now)),
  });
}

const chunks = <T>(rows: T[], size = 500) =>
  Array.from({ length: Math.ceil(rows.length / size) }, (_, index) =>
    rows.slice(index * size, (index + 1) * size),
  );

await db.transaction(async (tx) => {
  const old = await tx
    .select({ id: caseSchema.id })
    .from(caseSchema)
    .where(sql`${caseSchema.platformKey} ~ ${keyPattern}`);
  const oldIds = old.map((row) => row.id);

  for (const ids of chunks(oldIds)) {
    await tx.delete(caseEventSchema).where(inArray(caseEventSchema.caseId, ids));
    await tx.delete(caseReportSchema).where(inArray(caseReportSchema.caseId, ids));
    await tx.delete(caseTeamSchema).where(inArray(caseTeamSchema.caseId, ids));
    await tx.delete(caseSchema).where(inArray(caseSchema.id, ids));
  }

  await tx.delete(claimSchema).where(like(claimSchema.userId, 'seed\\_user\\_%'));

  for (const rows of chunks(cases)) {
    await tx.insert(caseSchema).values(rows);
  }

  for (const rows of chunks(claims)) {
    await tx.insert(claimSchema).values(rows);
  }

  for (const rows of chunks(reports)) {
    await tx.insert(caseReportSchema).values(rows);
  }

  for (const rows of chunks(events)) {
    await tx.insert(caseEventSchema).values(rows);
  }
});

const sealed = cases.filter((row) => row.status === 'sealed').length;
const building = cases.filter((row) => row.status === 'building').length;

console.log(
  `Seeded ${cases.length} cases (${cases.length - sealed - building} collecting, ${building} building, ${sealed} sealed), ${claims.length} claims, ${reports.length} reports, ${events.length} events.`,
);
process.exit(0);

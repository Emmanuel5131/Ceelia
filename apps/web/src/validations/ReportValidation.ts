import * as z from 'zod';

/** What the chain showed about one thing a platform said. `not_checkable` means the chain cannot show it, so it is not guessed. */
const checkResults = ['proven', 'partly_proven', 'not_proven', 'not_checkable'] as const;

export type CheckResult = (typeof checkResults)[number];

// Words Celia does not use: they declare fraud or promise an outcome. The court decides intent; the report only says what the
// chain shows. Kept short and literal on purpose: it catches slips, and a person still reviews every report before it is saved.
const forbidden =
  /\b(scam|scammer|scammers|fraud detected|guaranteed|recover your money|exposes?)\b/iu;

const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((value) => !forbidden.test(value), { message: 'forbidden_words' });

const CheckValidation = z.object({
  /** What the platform said, in its own words or close to them. */
  claim: text(500),
  /** What the chain shows about it. */
  evidence: text(1000),
  result: z.enum(checkResults),
});

const FigureValidation = z.object({
  label: text(60),
  value: text(40),
  note: text(120).optional(),
});

/**
 * The findings of one analysis, frozen. Sandworm produces it, staff check it and save it, and Celia stores it as the record, so
 * it can be shown the same way forever and its hash checked. It holds public facts only: counts, addresses of the platform,
 * what the tests found. Never a claimant's name, wallet or statement.
 */
export const ReportValidation = z.object({
  version: z.literal(1),
  /** One sentence in the house language: what the chain shows and does not. */
  headline: text(300),
  /** Up to four big numbers, such as wallets involved or total received. */
  figures: z.array(FigureValidation).max(4),
  checks: z.array(CheckValidation).min(1).max(20),
  method: z.object({
    /** The tests that were run, by name. */
    tests: z.array(text(120)).min(1).max(20),
    /** The hash the method was committed under before the data was read, when it was. */
    commitment: z
      .string()
      .regex(/^0x[\da-f]{64}$/iu)
      .optional(),
  }),
  /** When the chain data was read, as an ISO time. */
  dataAsOf: z.iso.datetime(),
  sources: z.array(text(120)).max(10),
});

export type Report = z.infer<typeof ReportValidation>;

/** A notebook link is only accepted on Sandworm's own domain, over https. */
export const NotebookUrlValidation = z
  .url({ protocol: /^https$/u })
  .refine((value) => new URL(value).hostname.endsWith('sandwormlab.xyz'), { message: 'host' });

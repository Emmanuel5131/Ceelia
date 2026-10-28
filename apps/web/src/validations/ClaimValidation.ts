import {
  chainIds,
  contactChannels,
  fraudTypes,
  isValidAddress,
  isValidTxHash,
  paidOnChain,
  paymentMethods,
  walletApps,
  walletTypes,
} from '@celia/core';
import * as z from 'zod';

/**
 * Optional text from a form: empty means "not given".
 * @param max - The longest it may be.
 * @returns The schema.
 */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? undefined : value))
    .optional();

/**
 * Whether text is a real calendar date as `YYYY-MM-DD`.
 * @param value - The text.
 * @returns True for a date that exists, such as 2026-02-28, and false for 2026-02-30 or any other shape.
 */
const isCalendarDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/u.test(value) &&
  new Date(`${value}T00:00:00Z`).toISOString().startsWith(value);

const claimShape = z.object({
  fraudTypes: z.array(z.enum(fraudTypes)).min(1),
  paymentMethod: z.enum(paymentMethods),
  chain: z.enum(chainIds),
  walletType: z.enum(walletTypes).optional(),
  walletApp: z.enum(walletApps).optional(),
  fundingTxHash: optionalText(200),
  destinationAddress: optionalText(200),
  firstPaymentOn: optionalText(10),
  lastPaymentOn: optionalText(10),
  assetSent: optionalText(100),
  walletAddress: optionalText(200),
  txHash: optionalText(200),
  unknownOperator: z.literal('on').optional(),
  platformName: optionalText(100),
  platformUrl: optionalText(300).refine(
    (value) => value === undefined || /^https?:\/\/\S+$/iu.test(value),
  ),
  operatorHandle: optionalText(100),
  tokenContract: optionalText(200),
  tokenName: optionalText(100),
  fraudDescription: optionalText(300),
  contactChannel: z.enum(contactChannels).optional(),
  amountLost: optionalText(100),
});

type ClaimInput = z.infer<typeof claimShape>;

/** Names the field that failed, so the form can send the person to it. */
type Fail = (path: string) => void;

/**
 * Checks how the money was paid: the wallet for a wallet payment, and every address or hash that was given, against the chain.
 * A bank or card payment has no chain, so none of those are checked for it.
 * @param claim - The parsed form.
 * @param fail - Reports a failed field.
 */
function checkPayment(claim: ClaimInput, fail: Fail) {
  // Only a wallet payment has to name something: the wallet. Anyone else may not have a transaction hash, and a bank or card
  // payment has none, so what they give is checked but never required.
  if (
    claim.paymentMethod === 'wallet' &&
    (!claim.walletAddress || !isValidAddress(claim.chain, claim.walletAddress))
  ) {
    fail('walletAddress');
  }

  if (!paidOnChain(claim.paymentMethod)) {
    return;
  }

  if (claim.txHash && !isValidTxHash(claim.chain, claim.txHash)) {
    fail('txHash');
  }

  if (claim.fundingTxHash && !isValidTxHash(claim.chain, claim.fundingTxHash)) {
    fail('fundingTxHash');
  }

  if (claim.destinationAddress && !isValidAddress(claim.chain, claim.destinationAddress)) {
    fail('destinationAddress');
  }
}

/**
 * Checks the first and last payment dates: real dates, not in the future, and the last no earlier than the first.
 * @param claim - The parsed form.
 * @param fail - Reports a failed field.
 */
function checkDates(claim: ClaimInput, fail: Fail) {
  const today = new Date().toISOString().slice(0, 10);

  for (const name of ['firstPaymentOn', 'lastPaymentOn'] as const) {
    const value = claim[name];

    if (value && (!isCalendarDate(value) || value > today)) {
      fail(name);
    }
  }

  if (claim.firstPaymentOn && claim.lastPaymentOn && claim.lastPaymentOn < claim.firstPaymentOn) {
    fail('lastPaymentOn');
  }
}

/**
 * The first step of a claim: what happened, how the money was paid, and who took it. Paying from your own wallet needs the
 * wallet; every other way needs the transaction hash instead. The operator's name is required unless the person says they do
 * not know it, because they often do not.
 */
export const CreateClaimValidation = claimShape.superRefine((claim, context) => {
  const fail: Fail = (path) => {
    context.addIssue({ code: 'custom', path: [path], message: path });
  };

  checkPayment(claim, fail);
  checkDates(claim, fail);

  if (claim.unknownOperator !== 'on' && (claim.platformName ?? '').length < 2) {
    fail('platformName');
  }
});

/** What the person says happened. Long enough to say something, short enough to read. */
export const StatementValidation = z.object({
  statement: z.string().trim().min(20).max(5000),
});

/** The signature the wallet produced. Its content is checked against the wallet, not here. */
export const SignatureValidation = z.object({
  signature: z.string().trim().min(1).max(500),
});

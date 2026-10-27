import {
  chainIds,
  contactChannels,
  fraudTypes,
  isValidAddress,
  isValidTxHash,
  paymentMethods,
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
 * The first step of a claim: what happened, how the money was paid, and who took it. Paying from your own wallet needs the
 * wallet; every other way needs the transaction hash instead. The operator's name is required unless the person says they do
 * not know it, because they often do not.
 */
export const CreateClaimValidation = z
  .object({
    fraudType: z.enum(fraudTypes),
    paymentMethod: z.enum(paymentMethods),
    chain: z.enum(chainIds),
    walletAddress: optionalText(200),
    txHash: optionalText(200),
    unknownOperator: z.literal('on').optional(),
    platformName: optionalText(100),
    platformUrl: optionalText(300).refine(
      (value) => value === undefined || /^https?:\/\/\S+$/iu.test(value),
    ),
    operatorHandle: optionalText(100),
    tokenContract: optionalText(200),
    contactChannel: z.enum(contactChannels).optional(),
    amountLost: optionalText(100),
  })
  .superRefine((claim, context) => {
    const fail = (path: string) => {
      context.addIssue({ code: 'custom', path: [path], message: path });
    };

    if (claim.paymentMethod === 'wallet') {
      if (!claim.walletAddress || !isValidAddress(claim.chain, claim.walletAddress)) {
        fail('walletAddress');
      }
    } else if (!claim.txHash || !isValidTxHash(claim.chain, claim.txHash)) {
      fail('txHash');
    }

    if (
      claim.paymentMethod === 'wallet' &&
      claim.txHash &&
      !isValidTxHash(claim.chain, claim.txHash)
    ) {
      fail('txHash');
    }

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

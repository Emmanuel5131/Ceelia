import { chainFamilies, isValidAddress } from '@celia/core';
import * as z from 'zod';

/** The first step of a claim: which wallet, on which chain, lost money to which platform. */
export const CreateClaimValidation = z
  .object({
    chain: z.enum(chainFamilies),
    walletAddress: z.string().trim().min(1).max(200),
    platformName: z.string().trim().min(2).max(100),
    platformUrl: z
      .string()
      .trim()
      .max(300)
      .refine((value) => value === '' || /^https?:\/\/\S+$/iu.test(value))
      .optional(),
  })
  .refine((value) => isValidAddress(value.chain, value.walletAddress), { path: ['walletAddress'] });

/** What the person says happened. Long enough to say something, short enough to read. */
export const StatementValidation = z.object({
  statement: z.string().trim().min(20).max(5000),
});

/** The signature the wallet produced. Its content is checked against the wallet, not here. */
export const SignatureValidation = z.object({
  signature: z.string().trim().min(1).max(500),
});

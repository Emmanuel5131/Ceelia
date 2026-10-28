import type { ChainId, FraudType } from '@celia/core';
import type { Claim } from '@/libs/Claims';
import { claimSteps } from '@/utils/ClaimSteps';

/** What the claims table needs from a claim. Nothing else crosses to the browser: no statement, nonce or signature. */
export type ClaimRow = {
  id: string;
  operator: string | null;
  fraudType: FraudType;
  chain: ChainId;
  /** The full wallet address or transaction hash, whichever the claim has. */
  reference: string;
  amountLost: string | null;
  status: 'draft' | 'submitted';
  /** Whether the person has proven they own the wallet: by signing, or to the satisfaction of staff. */
  confirmed: boolean;
  /** Whether Celia staff have checked the sent claim and its evidence. */
  validated: boolean;
  stepsDone: number;
  stepsTotal: number;
  updatedAt: string;
};

/**
 * A wallet address or transaction hash cut to its start and end, or a dash when the claim has neither, as when it was paid by
 * bank or card.
 * @param reference - The full address or hash, or an empty string.
 * @returns The short form.
 */
export function shortReference(reference: string) {
  return reference ? `${reference.slice(0, 8)}…${reference.slice(-6)}` : '—';
}

/**
 * Reduces a claim to the fields the claims table shows. Progress counts the first four steps, the ones the person controls.
 * @param claim - The claim.
 * @returns The table row.
 */
export function toClaimRow(claim: Claim): ClaimRow {
  const steps = claimSteps(claim).slice(0, 4);

  return {
    id: claim.id,
    operator: claim.platformName,
    fraudType: claim.fraudType,
    chain: claim.chain,
    reference: claim.walletAddress ?? claim.txHash ?? '',
    amountLost: claim.amountLost,
    status: claim.status === 'submitted' ? 'submitted' : 'draft',
    confirmed: claim.ownership === 'signed',
    validated: claim.validatedAt !== null,
    stepsDone: steps.filter((step) => step === 'done').length,
    stepsTotal: steps.length,
    updatedAt: claim.updatedAt.toISOString(),
  };
}

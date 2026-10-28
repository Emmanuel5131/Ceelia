import type { ChainId, FraudType } from '@celia/core';
import type { Claim } from '@/libs/claims/Claims';
import { claimSteps } from '@/utils/claims/ClaimSteps';

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
  /** Whether the wallet is proven: the person signed with it, or staff were satisfied by what they sent. */
  signed: boolean;
  /** Whether a person at Celia has confirmed the sent claim. A signature alone never makes a claim confirmed. */
  confirmed: boolean;
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
    signed: claim.ownership === 'signed',
    confirmed: claim.validatedAt !== null,
    stepsDone: steps.filter((step) => step === 'done').length,
    stepsTotal: steps.length,
    updatedAt: claim.updatedAt.toISOString(),
  };
}

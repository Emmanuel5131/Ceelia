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
  stepsDone: number;
  stepsTotal: number;
  updatedAt: string;
};

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
    stepsDone: steps.filter((step) => step === 'done').length,
    stepsTotal: steps.length,
    updatedAt: claim.updatedAt.toISOString(),
  };
}

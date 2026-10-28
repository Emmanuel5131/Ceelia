import type {
  ChainId,
  ContactChannel,
  FraudType,
  PaymentMethod,
  WalletApp,
  WalletType,
} from '@celia/core';
import type { Claim } from '@/libs/claims/Claims';

/** What the claim form shows when a draft is edited: only what the form asks for, never the nonce or a signature. */
export type ClaimDefaults = {
  fraudTypes: FraudType[];
  paymentMethod: PaymentMethod;
  chain: ChainId;
  walletApp: WalletApp | null;
  walletType: WalletType | null;
  walletAddress: string;
  fundingTxHash: string;
  destinationAddress: string;
  firstPaymentOn: string;
  lastPaymentOn: string;
  assetSent: string;
  txHash: string;
  platformName: string;
  platformUrl: string;
  operatorHandle: string;
  tokenContract: string;
  tokenName: string;
  fraudDescription: string;
  contactChannel: ContactChannel | null;
  amountLost: string;
};

/**
 * Reduces a claim to the answers the claim form takes, so a draft can be edited in the same form it was made in.
 * @param claim - The claim.
 * @returns The form's answers.
 */
export function toClaimDefaults(claim: Claim): ClaimDefaults {
  return {
    fraudTypes: claim.fraudTypes.length > 0 ? claim.fraudTypes : [claim.fraudType],
    paymentMethod: claim.paymentMethod,
    chain: claim.chain,
    walletApp: claim.walletApp,
    walletType: claim.walletType,
    walletAddress: claim.walletAddress ?? '',
    fundingTxHash: claim.fundingTxHash ?? '',
    destinationAddress: claim.destinationAddress ?? '',
    firstPaymentOn: claim.firstPaymentOn ?? '',
    lastPaymentOn: claim.lastPaymentOn ?? '',
    assetSent: claim.assetSent ?? '',
    txHash: claim.txHash ?? '',
    platformName: claim.platformName ?? '',
    platformUrl: claim.platformUrl ?? '',
    operatorHandle: claim.operatorHandle ?? '',
    tokenContract: claim.tokenContract ?? '',
    tokenName: claim.tokenName ?? '',
    fraudDescription: claim.fraudDescription ?? '',
    contactChannel: claim.contactChannel,
    amountLost: claim.amountLost ?? '',
  };
}

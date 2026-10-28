import { ownershipMessage, verifyOwnership } from '@celia/core';
import { asc, eq } from 'drizzle-orm';
import { listClaimExtras } from '@/libs/claims/ClaimExtras';
import type { Claim } from '@/libs/claims/Claims';
import { db } from '@/libs/DB';
import { claimProofSchema } from '@/models/Schema';
import { sealEvidence, sha256Hex } from '@/utils/claims/EvidenceRecord';

const iso = (date: Date | null) => date?.toISOString() ?? null;

/**
 * Makes the person's evidence record for a claim: what they added to show the wallet is theirs, with a fingerprint of every file,
 * the signature checked again, what the chain showed and their account, all dated and sealed with a fingerprint of its own.
 * @param claim - The person's own claim.
 * @param now - When the record is made.
 * @returns The sealed record.
 */
export async function buildClaimEvidence(claim: Claim, now: Date) {
  const files = await db
    .select()
    .from(claimProofSchema)
    .where(eq(claimProofSchema.claimId, claim.id))
    .orderBy(asc(claimProofSchema.createdAt));
  const extras = await listClaimExtras(claim.id);
  const message = claim.walletAddress
    ? ownershipMessage({ chain: claim.chain, address: claim.walletAddress, nonce: claim.nonce })
    : null;

  return sealEvidence({
    version: 1,
    generatedAt: now.toISOString(),
    claimId: claim.id,
    status: claim.status,
    createdAt: claim.createdAt.toISOString(),
    submittedAt: iso(claim.submittedAt),
    wallet: {
      chain: claim.chain,
      address: claim.walletAddress,
      paymentMethod: claim.paymentMethod,
    },
    ownership: {
      confirmed: claim.ownership === 'signed',
      method: claim.ownershipMethod,
      signedAt: iso(claim.signedAt),
      message: claim.signature ? message : null,
      signature: claim.signature,
      signatureValid:
        claim.signature && claim.walletAddress && message
          ? verifyOwnership({
              chain: claim.chain,
              address: claim.walletAddress,
              message,
              signature: claim.signature,
            })
          : null,
    },
    video: claim.reviewVideoUrl,
    files: files.map((file) => ({
      name: file.name,
      contentType: file.contentType,
      size: file.size,
      sha256: sha256Hex(file.data),
      addedAt: file.createdAt.toISOString(),
    })),
    more: {
      affected: extras.affected.map((row) => `${row.chain}: ${row.address}`),
      receiving: extras.receiving.map((row) => `${row.chain}: ${row.address}`),
      transactions: extras.transactions.map((row) => `${row.chain}: ${row.hash}`),
    },
    payment: {
      txHash: claim.txHash,
      fundingTxHash: claim.fundingTxHash,
      destinationAddress: claim.destinationAddress,
      firstPaymentOn: claim.firstPaymentOn,
      lastPaymentOn: claim.lastPaymentOn,
      assetSent: claim.assetSent,
      amountLost: claim.amountLost,
    },
    chainChecks: { transaction: claim.txCheck ?? null, funding: claim.fundingTxCheck ?? null },
    operator: { name: claim.platformName, website: claim.platformUrl },
    statement: claim.statement,
  });
}

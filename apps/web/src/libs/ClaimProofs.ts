import { and, asc, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { claimProofSchema, claimSchema } from '@/models/Schema';

export type ProofFile = { id: string; name: string; contentType: string; size: number };

/**
 * Lists the files sent for a claim, without their bytes.
 * @param claimId - The claim.
 * @returns The files, oldest first.
 */
export function listProofFiles(claimId: string) {
  return db
    .select({
      id: claimProofSchema.id,
      name: claimProofSchema.name,
      contentType: claimProofSchema.contentType,
      size: claimProofSchema.size,
    })
    .from(claimProofSchema)
    .where(eq(claimProofSchema.claimId, claimId))
    .orderBy(asc(claimProofSchema.createdAt));
}

/**
 * Reads one file with its bytes, only if it belongs to the claim.
 * @param claimId - The claim.
 * @param proofId - The file.
 * @returns The file, or undefined.
 */
export async function getProofFile(claimId: string, proofId: string) {
  const [file] = await db
    .select()
    .from(claimProofSchema)
    .where(and(eq(claimProofSchema.id, proofId), eq(claimProofSchema.claimId, claimId)));

  return file;
}

export type ReviewItem = {
  id: string;
  userId: string;
  chain: (typeof claimSchema.$inferSelect)['chain'];
  walletAddress: string | null;
  platformName: string | null;
  /** Whether the wallet is already confirmed by a signature, so staff know what else the person gave. */
  signed: boolean;
  videoUrl: string | null;
  note: string | null;
  requestedAt: Date | null;
  files: ProofFile[];
};

/**
 * Lists the claims with a video or files staff have not looked at yet, oldest request first, with the files each one sent.
 * @returns The claims.
 */
export async function listOwnershipReviews() {
  const claims = await db
    .select()
    .from(claimSchema)
    .where(and(isNotNull(claimSchema.reviewRequestedAt), isNull(claimSchema.reviewedAt)))
    .orderBy(asc(claimSchema.reviewRequestedAt), desc(claimSchema.createdAt));

  return await Promise.all(
    claims.map(async (claim): Promise<ReviewItem> => ({
      id: claim.id,
      userId: claim.userId,
      chain: claim.chain,
      walletAddress: claim.walletAddress,
      platformName: claim.platformName,
      signed: claim.ownershipMethod === 'signature',
      videoUrl: claim.reviewVideoUrl,
      note: claim.proofNote,
      requestedAt: claim.reviewRequestedAt,
      files: await listProofFiles(claim.id),
    })),
  );
}

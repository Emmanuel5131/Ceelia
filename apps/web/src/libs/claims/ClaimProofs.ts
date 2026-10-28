import { and, asc, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
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

/** How many rows a staff queue loads at a time. The rest appear as these are settled. */
export const queueLimit = 500;

/**
 * Lists the oldest claims with a video or files staff have not looked at yet, with the files each one sent. Files are read for all
 * of them in one query.
 * @returns The claims, oldest request first.
 */
export async function listOwnershipReviews() {
  const claims = await db
    .select()
    .from(claimSchema)
    .where(and(isNotNull(claimSchema.reviewRequestedAt), isNull(claimSchema.reviewedAt)))
    .orderBy(asc(claimSchema.reviewRequestedAt), desc(claimSchema.createdAt))
    .limit(queueLimit);
  const files =
    claims.length === 0
      ? []
      : await db
          .select({
            claimId: claimProofSchema.claimId,
            id: claimProofSchema.id,
            name: claimProofSchema.name,
            contentType: claimProofSchema.contentType,
            size: claimProofSchema.size,
          })
          .from(claimProofSchema)
          .where(
            inArray(
              claimProofSchema.claimId,
              claims.map((claim) => claim.id),
            ),
          )
          .orderBy(asc(claimProofSchema.createdAt));

  return claims.map((claim): ReviewItem => ({
    id: claim.id,
    userId: claim.userId,
    chain: claim.chain,
    walletAddress: claim.walletAddress,
    platformName: claim.platformName,
    signed: claim.ownershipMethod === 'signature',
    videoUrl: claim.reviewVideoUrl,
    note: claim.proofNote,
    requestedAt: claim.reviewRequestedAt,
    files: files
      .filter((file) => file.claimId === claim.id)
      .map(({ id, name, contentType, size }) => ({ id, name, contentType, size })),
  }));
}

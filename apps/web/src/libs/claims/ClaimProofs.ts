import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { claimProofSchema } from '@/models/Schema';

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

/** How many rows a staff queue loads at a time. The rest appear as these are settled. */
export const queueLimit = 500;

/**
 * Lists the files sent for several claims in one query, so a staff queue does not ask once per claim.
 * @param claimIds - The claims.
 * @returns The files of each claim that has any, oldest first; a claim with none is not in the map.
 */
export async function listProofFilesFor(claimIds: string[]) {
  const result = new Map<string, ProofFile[]>();

  if (claimIds.length === 0) {
    return result;
  }

  const files = await db
    .select({
      claimId: claimProofSchema.claimId,
      id: claimProofSchema.id,
      name: claimProofSchema.name,
      contentType: claimProofSchema.contentType,
      size: claimProofSchema.size,
    })
    .from(claimProofSchema)
    .where(inArray(claimProofSchema.claimId, claimIds))
    .orderBy(asc(claimProofSchema.createdAt));

  for (const { claimId, ...file } of files) {
    result.set(claimId, [...(result.get(claimId) ?? []), file]);
  }

  return result;
}

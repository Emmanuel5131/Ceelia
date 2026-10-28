import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { getProofFile } from '@/libs/ClaimProofs';
import { db } from '@/libs/DB';
import { claimSchema } from '@/models/Schema';
import { parseAccount } from '@/utils/Account';

const ids = z.object({ id: z.uuid(), proofId: z.uuid() });

/**
 * Sends back a file someone sent as proof of a wallet. Only the person who sent it and Celia staff can open it. The route is
 * under `/api`, which the proxy skips, so it checks who is asking itself. A missing file and a file that is not yours look
 * the same.
 * @param _request - The request (unused).
 * @param context - The route parameters.
 * @param context.params - The claim and file ids.
 * @returns The file, or 404.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; proofId: string }> },
) {
  const parsed = ids.safeParse(await context.params);
  const { userId } = await auth();

  if (!parsed.success || !userId) {
    return new NextResponse('Not found', { status: 404 });
  }

  const [claim] = await db
    .select({ userId: claimSchema.userId })
    .from(claimSchema)
    .where(eq(claimSchema.id, parsed.data.id));
  const user = await currentUser();
  const staff =
    claim?.userId === userId ? false : Boolean(parseAccount(user?.publicMetadata)?.staff);
  const file =
    claim && (claim.userId === userId || staff)
      ? await getProofFile(parsed.data.id, parsed.data.proofId)
      : undefined;

  if (!file) {
    return new NextResponse('Not found', { status: 404 });
  }

  const image = file.contentType.startsWith('image/');

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.contentType,
      'Content-Disposition': `${image ? 'inline' : 'attachment'}; filename="proof-${file.id}"`,
      'Content-Length': String(file.size),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}

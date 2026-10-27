import * as z from 'zod';
import type { AccountType } from '@/utils/Account';

const PersonProfileMetadata = z.object({ country: z.string() });

const CounselProfileMetadata = z.object({
  firm: z.string().nullable().optional(),
  registrations: z.array(z.object({ jurisdiction: z.string() })),
});

export type Profile =
  | { accountType: 'person'; country: string }
  | { accountType: 'counsel'; firm: string | null; jurisdictions: string[] };

/**
 * Reads what a person gave in onboarding from their Clerk `privateMetadata`, which only the server can read or write.
 * @param accountType - The account type, from `parseAccount`.
 * @param metadata - The raw private metadata.
 * @returns The profile, or null when there is none, as for an account made before these details were kept.
 */
export function parseProfile(accountType: AccountType, metadata: unknown): Profile | null {
  if (accountType === 'person') {
    const parsed = PersonProfileMetadata.safeParse(metadata);

    return parsed.success ? { accountType, country: parsed.data.country } : null;
  }

  const parsed = CounselProfileMetadata.safeParse(metadata);

  return parsed.success
    ? {
        accountType,
        firm: parsed.data.firm ?? null,
        jurisdictions: parsed.data.registrations.map((registration) => registration.jurisdiction),
      }
    : null;
}

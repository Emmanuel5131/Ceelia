import * as z from 'zod';

/**
 * What a signed-in person is on Celia. A `person` reports a loss and can later add a researcher profile. `counsel` is a
 * lawyer acting for a firm. The type is chosen once, in onboarding, and written to Clerk's `publicMetadata` by the server.
 */
const AccountValidation = z.object({
  accountType: z.enum(['person', 'counsel']),
  /** Counsel only: `pending` until staff have checked the registration. */
  review: z.enum(['pending', 'verified']).optional(),
});

export type Account = z.infer<typeof AccountValidation>;
export type AccountType = Account['accountType'];

/**
 * Reads the account from a person's Clerk `publicMetadata`.
 * @param metadata - The raw metadata.
 * @returns The account, or null when onboarding has not been completed. A missing account never defaults to a role,
 * because some roles can see victim data.
 */
export function parseAccount(metadata: unknown): Account | null {
  const parsed = AccountValidation.safeParse(metadata);

  return parsed.success ? parsed.data : null;
}

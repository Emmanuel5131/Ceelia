import * as z from 'zod';

/** Query string of `GET /api/jurisdictions`. */
export const JurisdictionSearchValidation = z.object({
  q: z.string().trim().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(8),
  kind: z.enum(['country', 'subdivision']).optional(),
});

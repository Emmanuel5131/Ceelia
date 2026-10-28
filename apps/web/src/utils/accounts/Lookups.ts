import * as z from 'zod';
import type { LookupResult } from '@/utils/accounts/Institution';

const RegistryResponse = z.object({
  results: z.object({
    companies: z.array(
      z.object({
        company: z.object({
          name: z.string(),
          company_number: z.string(),
          jurisdiction_code: z.string(),
          current_status: z.string().nullable().optional(),
          opencorporates_url: z.string().optional(),
        }),
      }),
    ),
  }),
});

const SanctionsResponse = z.object({
  responses: z.record(
    z.string(),
    z.object({
      results: z.array(
        z.object({
          id: z.string(),
          caption: z.string(),
          score: z.number(),
          match: z.boolean(),
        }),
      ),
    }),
  ),
});

// Only an https link is kept, so a link from a lookup can never be a script.
const safeLink = (link: string | undefined) => (link?.startsWith('https://') ? link : null);

/**
 * Reads a company registry search (OpenCorporates) into what staff see. It lists the companies found, so staff can compare the
 * name, number and status with what the applicant gave. A search that finds nothing is `none`, which says nothing is on record
 * under that name, not that the organisation is false.
 * @param json - The response body.
 * @returns The result.
 */
export function readRegistry(json: unknown): LookupResult {
  const parsed = RegistryResponse.safeParse(json);

  if (!parsed.success) {
    return { status: 'unavailable', matches: [] };
  }

  const matches = parsed.data.results.companies.map(({ company }) => ({
    name: company.name,
    detail: [company.company_number, company.jurisdiction_code, company.current_status]
      .filter(Boolean)
      .join(' · '),
    link: safeLink(company.opencorporates_url),
  }));

  return { status: matches.length > 0 ? 'found' : 'none', matches };
}

/**
 * Reads a sanctions screening (OpenSanctions) into what staff see. Anything the service scored as a match is listed as a
 * possible match for staff to look at; it is never a finding on its own, because names collide.
 * @param json - The response body.
 * @returns The result.
 */
export function readSanctions(json: unknown): LookupResult {
  const parsed = SanctionsResponse.safeParse(json);

  if (!parsed.success) {
    return { status: 'unavailable', matches: [] };
  }

  const matches = Object.values(parsed.data.responses)
    .flatMap((response) => response.results)
    .filter((result) => result.match)
    .map((result) => ({
      name: result.caption,
      detail: `${Math.round(result.score * 100)}%`,
      link: `https://www.opensanctions.org/entities/${encodeURIComponent(result.id)}/`,
    }));

  return { status: matches.length > 0 ? 'possible_match' : 'clear', matches };
}

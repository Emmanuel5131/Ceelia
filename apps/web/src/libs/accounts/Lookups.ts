import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import type { LookupResult } from '@/utils/accounts/Institution';
import { readRegistry, readSanctions } from '@/utils/accounts/Lookups';

const off: LookupResult = { status: 'off', matches: [] };
const unavailable: LookupResult = { status: 'unavailable', matches: [] };

/**
 * Searches the company registry (OpenCorporates) for the organisation an applicant named. The result is for staff to compare with
 * what the applicant gave; it does not decide anything.
 * @param organisation - The organisation's name, or null for an independent lawyer.
 * @returns What was found, `off` when the lookup is not set up, or `unavailable` when it could not be reached.
 */
export async function lookupRegistry(organisation: string | null): Promise<LookupResult> {
  if (!Env.OPENCORPORATES_API_TOKEN || !organisation) {
    return off;
  }

  const url = new URL('https://api.opencorporates.com/v0.4/companies/search');
  url.searchParams.set('q', organisation);
  url.searchParams.set('per_page', '5');
  url.searchParams.set('order', 'score');
  url.searchParams.set('api_token', Env.OPENCORPORATES_API_TOKEN);

  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) }).catch(() => null);

  if (!response?.ok) {
    logger.warn('Registry lookup could not be made');

    return unavailable;
  }

  return readRegistry(await response.json());
}

/**
 * Screens the organisation and the applicant against sanctions lists (OpenSanctions). Anything scored as a match is listed for
 * staff to look at; names collide, so a match is never a finding by itself.
 * @param names - The organisation's name (null for an independent lawyer) and the applicant's name.
 * @param names.organisation - The organisation.
 * @param names.person - The applicant.
 * @returns What was found, `off` when the lookup is not set up, or `unavailable` when it could not be reached.
 */
export async function lookupSanctions(names: {
  organisation: string | null;
  person: string;
}): Promise<LookupResult> {
  if (!Env.OPENSANCTIONS_API_KEY) {
    return off;
  }

  const queries = {
    ...(names.organisation && {
      organisation: { schema: 'Organization', properties: { name: [names.organisation] } },
    }),
    ...(names.person && { person: { schema: 'Person', properties: { name: [names.person] } } }),
  };

  if (Object.keys(queries).length === 0) {
    return off;
  }

  const response = await fetch('https://api.opensanctions.org/match/default?limit=5', {
    method: 'POST',
    headers: {
      authorization: `ApiKey ${Env.OPENSANCTIONS_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ queries }),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);

  if (!response?.ok) {
    logger.warn('Sanctions lookup could not be made');

    return unavailable;
  }

  return readSanctions(await response.json());
}

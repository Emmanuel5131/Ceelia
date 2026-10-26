# @celia/jurisdictions

Every country, state, province and region, and which of four kinds of rule decides whether electronic evidence is accepted there:
**certificate**, **authentication**, **presumption** or **equal treatment**. One package feeds the landing site's search, the app's
Jurisdictions page and the app's API.

## Use it

```ts
import { coverage, getJurisdiction, searchJurisdictions } from '@celia/jurisdictions';

searchJurisdictions('new york');   // New York (US state), best match first
searchJurisdictions('NGA');        // Nigeria
getJurisdiction('us-ny');          // one jurisdiction by id (lowercase ISO 3166 code)
coverage();                        // { total, countries, withRule }
```

In `apps/web`: `GET /api/jurisdictions?q=new%20york&limit=5` and `GET /api/jurisdictions/us-ny`. In the app UI, use
`JurisdictionFinder` (`src/components/JurisdictionFinder.tsx`).

## What is covered
- **Every country and territory** (ISO 3166-1, 249 plus the European Union) and **every subdivision** (ISO 3166-2, about 5,000).
- **Only countries carry a rule.** Every state, province and region uses the national rule of its country. The search still finds
  them (New York, Ontario, Lagos), and the answer says "Uses the national rule of ...".
- A jurisdiction's `status` says how sure we are: `built` (Celia's certificate is built to it), `mapped` (a rule from public sources,
  not yet confirmed by counsel), `inherited` (a state, province or region, so it uses its country's rule), `none` (not mapped;
  we never guess). Countries without a mapped rule show `none`.
- Subdivision names come from ISO 3166-2, which often uses local-language names (for example `Bayern`).

## Where the rules come from
- `src/data/curated.ts`: hand-curated rules from public sources (edit this to add or change a rule).
- `scripts/uncitral-mlec.json`: a snapshot of the UNCITRAL table of enactments of the Model Law on Electronic Commerce. Countries on
  it become *equal treatment*. The states and provinces on that table are not used.
- ISO 3166 for the list of places.

After changing either, run `pnpm --filter @celia/jurisdictions generate`. **Everything here is a research note until counsel
confirms it. It is not legal advice.**

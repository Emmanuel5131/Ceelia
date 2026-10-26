// Builds src/data/countries.ts and subdivisions.ts from:
//   - src/data/curated.ts          (hand-curated rules, edit this one)
//   - scripts/uncitral-mlec.json   (snapshot of the UNCITRAL status table for the Model Law on Electronic Commerce)
//   - ISO 3166-1 and ISO 3166-2    (every country and every subdivision, through the two dev dependencies)
// Every state, province and region uses the rule of its country: only countries carry a rule of their own.
// Run: pnpm --filter @celia/jurisdictions generate
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { curatedRules } from '../src/data/curated.ts';

const require = createRequire(import.meta.url);
const iso = require('i18n-iso-countries');
iso.registerLocale(require('i18n-iso-countries/langs/en.json'));
const iso2 = require('iso-3166-2');
const subData = iso2.data ?? iso2;
const mlec = JSON.parse(fs.readFileSync(new URL('./uncitral-mlec.json', import.meta.url), 'utf8'));
const out = (name) => new URL(`../src/data/${name}`, import.meta.url);
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// UNCITRAL names that differ from the ISO names
const alias = { 'British Virgin Islands': 'VG', 'Viet Nam': 'VN', 'Cabo Verde': 'CV', 'Iran (Islamic Republic of)': 'IR', 'Venezuela (Bolivarian Republic of)': 'VE', 'Hong Kong, China': 'HK', 'Macao, China': 'MO', China: 'CN', 'Republic of Korea': 'KR', "Lao People's Democratic Republic": 'LA', 'Syrian Arab Republic': 'SY', 'United Republic of Tanzania': 'TZ', 'Brunei Darussalam': 'BN', 'Timor-Leste': 'TL', Eswatini: 'SZ', 'Bailiwick of Guernsey': 'GG', 'Bailiwick of Jersey': 'JE', 'United States Virgin Islands': 'VI', 'Puerto Rico': 'PR', Guam: 'GU' };
const countryCode = (n) => alias[n] || iso.getAlpha2Code(n, 'en');

// The UNCITRAL table also lists US states, Canadian provinces, Australian states and a free zone. They are not countries, so skip them here.
const notCountries = new Set(['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming','Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon','Australian Capital Territory','New South Wales','Northern Territory','Queensland','South Australia','Tasmania','Victoria','Western Australia','Abu Dhabi Global Market']);
const mlecCountry = {};
for (const e of mlec) {
  if (notCountries.has(e.name)) continue;
  const c = countryCode(e.name);
  if (!c) { console.error('UNMATCHED', e.name); continue; }
  mlecCountry[c] = e.year;
}
const curated = Object.fromEntries(curatedRules.map((r) => [r.code, r]));

// ---- countries ----
const specialAliases = { US: ['USA', 'America', 'United States'], GB: ['UK', 'Great Britain', 'Britain'], AE: ['UAE', 'Emirates'], KR: ['Korea'], CZ: ['Czechia'], CI: ['Ivory Coast'], MM: ['Burma'], TR: ['Turkey'] };
const countries = [];
for (const code of Object.keys(iso.getNames('en'))) {
  const name = iso.getName(code, 'en', { select: 'official' });
  const common = iso.getName(code, 'en', { select: 'alias' });
  const search = [...new Set([code, iso.alpha2ToAlpha3(code), ...(common && common !== name ? [common] : []), ...(specialAliases[code] ?? [])])];
  let rule = { mode: null, law: null, status: 'none' };
  if (curated[code]) rule = { mode: curated[code].mode, law: curated[code].law, status: curated[code].built ? 'built' : 'mapped' };
  else if (mlecCountry[code]) rule = { mode: 'equal', law: `Electronic transactions law (${mlecCountry[code]})`, status: 'mapped' };
  countries.push({ code, name, kind: 'country', search, ...rule });
}
if (curated.EU) countries.push({ code: 'EU', name: 'European Union', kind: 'union', search: ['EU', 'Europe'], mode: curated.EU.mode, law: curated.EU.law, status: 'mapped' });
countries.sort((a, b) => a.name.localeCompare(b.name));
const countryNames = new Set(countries.flatMap((c) => [c.name, ...c.search]).map(norm));

// ---- subdivisions (every ISO 3166-2 entry that is not itself a country listed above) ----
const subdivisions = [];
for (const [cc, c] of Object.entries(subData)) {
  for (const [code, s] of Object.entries(c.sub ?? {})) {
    if (countryNames.has(norm(s.name)) && s.type !== 'State' && s.type !== 'Province') continue; // overseas territories already exist as countries
    if (cc === 'US' && ['AS', 'GU', 'MP', 'PR', 'UM', 'VI'].some((t) => code === `US-${t}`)) continue;
    subdivisions.push([code, s.name, s.type]);
  }
}
subdivisions.sort((a, b) => a[0].localeCompare(b[0]));

// ---- write ----
const header = (what) => `// Generated by scripts/generate.mjs. Do not edit by hand: change src/data/curated.ts or the script, then run \`pnpm --filter @celia/jurisdictions generate\`.\n// ${what}\n`;
fs.writeFileSync(out('countries.ts'), `${header('Every country and territory (ISO 3166-1), plus the European Union.')}import type { Jurisdiction } from '../types';\n\nexport type CountryRow = Pick<Jurisdiction, 'name' | 'kind' | 'mode' | 'law' | 'status'> & { code: string; search: string[] };\n\nexport const countries: CountryRow[] = ${JSON.stringify(countries, null, 2)};\n`);
fs.writeFileSync(out('subdivisions.ts'), `${header('Every subdivision (ISO 3166-2): [code, name, type]. The country is the part of the code before the dash. All of them use their country\'s rule.')}export type SubdivisionRow = [code: string, name: string, type: string];\n\nexport const subdivisions: SubdivisionRow[] = [\n${subdivisions.map((r) => `  ${JSON.stringify(r)},`).join('\n')}\n];\n`);
console.log(`countries ${countries.length} (mapped ${countries.filter((c) => c.mode).length}), subdivisions ${subdivisions.length}`);

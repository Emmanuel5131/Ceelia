import { countries } from './data/countries';
import { subdivisions } from './data/subdivisions';
import type { Jurisdiction } from './types';

type Row = { j: Jurisdiction; name: string; hay: string; codes: string[]; words: string[] };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const lower = (s: string) => s.toLowerCase();

let cache: { rows: Row[]; byId: Map<string, Jurisdiction> } | undefined;

function build() {
  const rows: Row[] = [];
  const byId = new Map<string, Jurisdiction>();
  const add = (j: Jurisdiction, search: string[]) => {
    const name = norm(j.name);
    rows.push({ j, name, hay: norm([j.name, j.parent?.name ?? '', ...search].join(' ')), codes: search.map(norm), words: name.split(' ') });
    byId.set(j.id, j);
  };

  const countryById = new Map<string, Jurisdiction>();
  for (const c of countries) {
    const j: Jurisdiction = { id: lower(c.code), name: c.name, kind: c.kind, mode: c.mode, law: c.law, status: c.status };
    countryById.set(j.id, j);
    add(j, c.search);
  }

  for (const [code, name, type] of subdivisions) {
    const dash = code.indexOf('-');
    const parent = countryById.get(lower(code.slice(0, dash)));
    if (!parent) continue;
    const suffix = code.slice(dash + 1);
    const search = [code, ...(/^[A-Z]{1,4}$/u.test(suffix) ? [suffix] : [])];
    const base = { id: lower(code), name, parent: { id: parent.id, name: parent.name }, kind: type.toLowerCase() };
    if (parent.mode) {
      add({ ...base, mode: parent.mode, law: parent.law, status: 'inherited' }, search);
    } else {
      add({ ...base, mode: null, law: null, status: 'none' }, search);
    }
  }

  return { rows, byId };
}

const index = () => (cache ??= build());

/**
 * Finds jurisdictions by name, code or common abbreviation: "new york", "NY", "nga", "uk".
 * @param query - What the person typed.
 * @param options - `limit` caps the results (default 8, at most 50); `kind` limits them to countries or to anything inside a country.
 * @returns The best matches first. Countries come before the states and regions that share a name.
 */
export function searchJurisdictions(query: string, options: { limit?: number; kind?: 'country' | 'subdivision' } = {}): Jurisdiction[] {
  const q = norm(query);
  if (!q) return [];
  const limit = Math.min(Math.max(options.limit ?? 8, 1), 50);
  const ranked: { j: Jurisdiction; rank: number }[] = [];
  for (const r of index().rows) {
    if (options.kind === 'country' && r.j.parent) continue;
    if (options.kind === 'subdivision' && !r.j.parent) continue;
    const rank = r.codes.includes(q) || r.name === q ? 0 : r.name.startsWith(q) ? 1 : r.words.some((w) => w.startsWith(q)) ? 2 : r.hay.includes(q) ? 3 : 9;
    if (rank < 9) ranked.push({ j: r.j, rank: rank * 2 + (r.j.parent ? 1 : 0) });
  }
  ranked.sort((a, b) => a.rank - b.rank || a.j.name.localeCompare(b.j.name));
  return ranked.slice(0, limit).map((x) => x.j);
}

/**
 * Looks up one jurisdiction by its id.
 * @param id - A lowercase ISO 3166 code such as `ng` or `us-ny`, or a custom id such as `adgm`.
 * @returns The jurisdiction, or undefined when there is no such id.
 */
export function getJurisdiction(id: string): Jurisdiction | undefined {
  return index().byId.get(lower(id));
}

/**
 * Lists every jurisdiction the finder can show.
 * @param kind - Limits the list to countries, or to the states and regions inside them.
 * @returns The jurisdictions, countries first.
 */
export function listJurisdictions(kind?: 'country' | 'subdivision'): Jurisdiction[] {
  return [...index().byId.values()].filter((j) => !kind || (kind === 'subdivision') === Boolean(j.parent));
}

/**
 * Counts what is covered.
 * @returns The total number of jurisdictions, how many are countries, and how many have a rule (their own or inherited).
 */
export function coverage() {
  const all = [...index().byId.values()];
  return { total: all.length, countries: all.filter((j) => !j.parent).length, withRule: all.filter((j) => j.mode).length };
}

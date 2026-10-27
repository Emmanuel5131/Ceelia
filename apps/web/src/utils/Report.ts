import { createHash } from 'node:crypto';

/**
 * Writes JSON with the keys of every object in sorted order, so the same findings always give the same text, however the
 * source ordered its keys.
 * @param value - Any JSON value.
 * @returns The canonical JSON text.
 */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }

  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

/**
 * The hash of a report: SHA-256 of its canonical JSON. Anyone holding the findings can recompute it and compare, so a stored
 * report that was changed no longer matches the hash shown with it.
 * @param report - The findings.
 * @returns The hash as `0x` and 64 hex characters.
 */
export function hashReport(report: unknown) {
  return `0x${createHash('sha256').update(canonicalJson(report)).digest('hex')}`;
}

import type { Jurisdiction } from '@celia/jurisdictions';

/**
 * The name to show for a jurisdiction: a state or region carries its country, as in "New York, United States".
 * @param jurisdiction - The jurisdiction.
 * @returns The name.
 */
export function jurisdictionName(jurisdiction: Jurisdiction) {
  return jurisdiction.parent
    ? `${jurisdiction.name}, ${jurisdiction.parent.name}`
    : jurisdiction.name;
}

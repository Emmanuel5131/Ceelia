/** The four kinds of people who use Celia. */
const roles = ['victim', 'lawyer', 'researcher', 'analyst'] as const;

export type Role = (typeof roles)[number];

/**
 * Reads a person's role from their Clerk `publicMetadata.role`.
 * @param value - The raw metadata value.
 * @returns The role, or `lawyer` when none is set yet (the first screens are built for lawyers and firms).
 */
export function parseRole(value: unknown): Role {
  return roles.find((role) => role === value) ?? 'lawyer';
}

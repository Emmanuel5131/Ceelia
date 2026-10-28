// A value as text, so a date, a list and a plain value compare the same way; nothing is the same as missing.
const asText = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  // Values here are plain text, numbers, booleans or lists; anything else is written out as JSON.
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : JSON.stringify(value);
};

/**
 * Finds which fields of a claim an edit changed. Only the fields named in `after` are compared, and a value that is empty before
 * and after is not a change. The one-time nonce is left out: it is made fresh each time and says nothing about what the person
 * wrote.
 * @param before - The claim as it was.
 * @param after - The values being saved.
 * @returns Each changed field with its old and new value, or an empty object when nothing changed.
 */
export function claimChanges(before: Record<string, unknown>, after: Record<string, unknown>) {
  const changes: Record<string, { from: string | null; to: string | null }> = {};

  for (const [field, value] of Object.entries(after)) {
    const from = asText(before[field]);
    const to = asText(value);

    if (field !== 'nonce' && from !== to) {
      changes[field] = { from, to };
    }
  }

  return changes;
}

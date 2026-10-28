import { describe, expect, it } from 'vitest';
import { identityOutcome } from './IdentityCheck';

describe(identityOutcome, () => {
  it('passes a verified result', () => {
    expect(identityOutcome('verified')).toBe('verified');
  });

  it.each(['manual_review', 'failed', '', null, undefined])('fails %s', (result) => {
    expect(identityOutcome(result)).toBe('failed');
  });
});

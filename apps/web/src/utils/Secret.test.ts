import { describe, expect, it } from 'vitest';
import { matchesSecret } from './Secret';

describe(matchesSecret, () => {
  it('accepts the same secret', () => {
    expect(matchesSecret('abc', 'abc')).toBeTruthy();
  });

  it('rejects a different secret', () => {
    expect(matchesSecret('abd', 'abc')).toBeFalsy();
  });

  it('rejects a secret of another length', () => {
    expect(matchesSecret('abcd', 'abc')).toBeFalsy();
  });

  it('rejects everything when no secret is set', () => {
    expect(matchesSecret('', null)).toBeFalsy();
    expect(matchesSecret('abc', null)).toBeFalsy();
  });

  it('rejects a missing header', () => {
    expect(matchesSecret(null, 'abc')).toBeFalsy();
  });
});

import { describe, expect, it } from 'vitest';
import { parseProfile } from './Profile';

describe(parseProfile, () => {
  it('reads a person with a country', () => {
    expect(parseProfile('person', { country: 'ng' })).toStrictEqual({
      accountType: 'person',
      country: 'ng',
    });
  });

  it('reads counsel with a firm and their jurisdictions', () => {
    expect(
      parseProfile('counsel', {
        firm: 'Adeyemi & Co',
        registrations: [{ jurisdiction: 'ng' }, { jurisdiction: 'gb', number: 'SCN1' }],
      }),
    ).toStrictEqual({
      accountType: 'counsel',
      firm: 'Adeyemi & Co',
      jurisdictions: ['ng', 'gb'],
    });
  });

  it('reads independent counsel as having no firm', () => {
    expect(parseProfile('counsel', { firm: null, registrations: [] })).toMatchObject({
      firm: null,
    });
  });

  it('finds no profile for an account made before details were kept', () => {
    expect(parseProfile('person', {})).toBeNull();
  });
});

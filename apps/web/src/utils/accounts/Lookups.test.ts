import { describe, expect, it } from 'vitest';
import { readRegistry, readSanctions } from '@/utils/accounts/Lookups';

describe(readRegistry, () => {
  const company = {
    name: 'ADEYEMI & CO LIMITED',
    company_number: '12345',
    jurisdiction_code: 'ng',
    current_status: 'Active',
    opencorporates_url: 'https://opencorporates.com/companies/ng/12345',
  };

  it('lists the companies found', () => {
    expect(readRegistry({ results: { companies: [{ company }] } })).toStrictEqual({
      status: 'found',
      matches: [
        {
          name: 'ADEYEMI & CO LIMITED',
          detail: '12345 · ng · Active',
          link: 'https://opencorporates.com/companies/ng/12345',
        },
      ],
    });
  });

  it('says none when nothing is on record', () => {
    expect(readRegistry({ results: { companies: [] } }).status).toBe('none');
  });

  it('keeps no link that is not https', () => {
    const result = readRegistry({
      results: {
        companies: [
          { company: { ...company, opencorporates_url: ['javascript', 'alert(1)'].join(':') } },
        ],
      },
    });

    expect(result.matches[0]?.link).toBeNull();
  });

  it('says unavailable for a body it does not understand', () => {
    expect(readRegistry({ error: 'nope' }).status).toBe('unavailable');
  });
});

describe(readSanctions, () => {
  it('lists what scored as a match', () => {
    const result = readSanctions({
      responses: {
        org: {
          results: [
            { id: 'NK-abc', caption: 'Some Company', score: 0.92, match: true },
            { id: 'NK-def', caption: 'Other Company', score: 0.4, match: false },
          ],
        },
        person: { results: [] },
      },
    });

    expect(result).toStrictEqual({
      status: 'possible_match',
      matches: [
        {
          name: 'Some Company',
          detail: '92%',
          link: 'https://www.opensanctions.org/entities/NK-abc/',
        },
      ],
    });
  });

  it('is clear when nothing matched', () => {
    expect(
      readSanctions({
        responses: { org: { results: [{ id: 'NK-x', caption: 'X', score: 0.3, match: false }] } },
      }).status,
    ).toBe('clear');
  });

  it('says unavailable for a body it does not understand', () => {
    expect(readSanctions({}).status).toBe('unavailable');
  });
});

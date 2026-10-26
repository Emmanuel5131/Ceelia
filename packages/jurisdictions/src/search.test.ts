import { describe, expect, it } from 'vitest';
import { coverage, getJurisdiction, searchJurisdictions } from './index';

describe('searchJurisdictions', () => {
  it('finds a US state by name and by postal code', () => {
    expect(searchJurisdictions('new york')[0]?.id).toBe('us-ny');
    expect(searchJurisdictions('NY')[0]?.id).toBe('us-ny');
  });

  it('finds a country by ISO code and by common name', () => {
    expect(searchJurisdictions('NGA')[0]?.name).toBe('Nigeria');
    expect(searchJurisdictions('uk')[0]?.name).toBe('United Kingdom');
  });

  it('puts the country before a state that shares its name', () => {
    expect(searchJurisdictions('georgia').map((j) => j.id).slice(0, 2)).toEqual(['ge', 'us-ga']);
  });

  it('returns nothing for an empty query', () => {
    expect(searchJurisdictions('  ')).toEqual([]);
  });
});

describe('getJurisdiction', () => {
  it('returns a mapped rule for Nigeria', () => {
    expect(getJurisdiction('ng')).toMatchObject({ mode: 'certificate', status: 'built' });
  });

  it('gives a state the national rule of its country', () => {
    expect(getJurisdiction('us-tx')).toMatchObject({ mode: 'certificate', status: 'inherited' });
    expect(getJurisdiction('us-ny')).toMatchObject({ mode: 'certificate', status: 'inherited' });
    expect(getJurisdiction('ca-on')).toMatchObject({ mode: 'authentication', status: 'inherited' });
  });

  it('makes a region inherit its country rule', () => {
    expect(getJurisdiction('gb-sct')).toMatchObject({ mode: 'presumption', status: 'inherited' });
  });

  it('never guesses a rule for an unmapped country', () => {
    expect(getJurisdiction('aw')).toMatchObject({ mode: null, status: 'none' });
  });
});

describe('coverage', () => {
  it('covers every ISO country and thousands of subdivisions', () => {
    const c = coverage();
    expect(c.countries).toBeGreaterThanOrEqual(249);
    expect(c.total).toBeGreaterThan(5000);
  });
});

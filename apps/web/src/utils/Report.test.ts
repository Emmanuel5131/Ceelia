import { describe, expect, it } from 'vitest';
import { ReportValidation } from '@/validations/ReportValidation';
import { canonicalJson, hashReport } from './Report';

const report = {
  version: 1,
  headline: 'The chain shows 142 wallets sending funds to one address. It does not show intent.',
  figures: [{ label: 'Wallets', value: '142' }],
  checks: [
    {
      claim: 'Withdrawals are always available.',
      evidence: 'No withdrawals appear after the 14th of September.',
      result: 'proven',
    },
  ],
  method: { tests: ['Funding trail', 'Concentration'] },
  dataAsOf: '2026-10-27T10:00:00Z',
  sources: ['Solana RPC'],
};

describe(canonicalJson, () => {
  it('orders keys so the same findings give the same text', () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe(
      canonicalJson({ a: { c: 3, d: 2 }, b: 1 }),
    );
  });

  it('keeps the order of a list', () => {
    expect(canonicalJson([2, 1])).toBe('[2,1]');
  });

  it('leaves out undefined values', () => {
    expect(canonicalJson({ a: 1, b: undefined })).toBe('{"a":1}');
  });
});

describe(hashReport, () => {
  it('gives the same hash however the keys were ordered', () => {
    const reordered = Object.fromEntries(Object.entries(report).toReversed());

    expect(hashReport(reordered)).toBe(hashReport(report));
  });

  it('changes when a finding changes', () => {
    const changed = {
      ...report,
      checks: [{ ...report.checks[0], result: 'not_proven' }],
    };

    expect(hashReport(changed)).not.toBe(hashReport(report));
  });

  it('is 0x and 64 hex characters', () => {
    expect(hashReport(report)).toMatch(/^0x[\da-f]{64}$/u);
  });
});

describe('Report format', () => {
  it('accepts a report in the house language', () => {
    expect(ReportValidation.safeParse(report).success).toBeTruthy();
  });

  it('rejects a report with no checks', () => {
    expect(ReportValidation.safeParse({ ...report, checks: [] }).success).toBeFalsy();
  });

  it('rejects text that declares fraud', () => {
    expect(
      ReportValidation.safeParse({ ...report, headline: 'This platform is a scam.' }).success,
    ).toBeFalsy();
  });

  it('rejects text that promises an outcome', () => {
    expect(
      ReportValidation.safeParse({
        ...report,
        checks: [{ ...report.checks[0], evidence: 'Victims are guaranteed a payout.' }],
      }).success,
    ).toBeFalsy();
  });

  it('rejects a result that is not one of the four', () => {
    expect(
      ReportValidation.safeParse({
        ...report,
        checks: [{ ...report.checks[0], result: 'fraud' }],
      }).success,
    ).toBeFalsy();
  });

  it('rejects a commitment that is not a 32-byte hash', () => {
    expect(
      ReportValidation.safeParse({ ...report, method: { ...report.method, commitment: '0x12' } })
        .success,
    ).toBeFalsy();
  });
});

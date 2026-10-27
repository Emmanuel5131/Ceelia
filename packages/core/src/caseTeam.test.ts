import { describe, expect, it } from 'vitest';
import { canTakeCase, maxOpenCasesPerLawyer } from './caseTeam';
import type { TakeCaseInput } from './caseTeam';

const ready: TakeCaseInput = {
  verified: true,
  caseSealed: true,
  caseHasLead: false,
  admittedInJurisdiction: true,
  isClaimant: false,
  conflictsConfirmed: true,
  openCases: 0,
};

describe(canTakeCase, () => {
  it('lets a verified lawyer take a sealed case they are admitted for', () => {
    expect(canTakeCase(ready)).toStrictEqual({ ok: true });
  });

  it('refuses a lawyer staff have not verified', () => {
    expect(canTakeCase({ ...ready, verified: false })).toStrictEqual({
      ok: false,
      reason: 'not_verified',
    });
  });

  it('refuses a case without a sealed evidence file', () => {
    expect(canTakeCase({ ...ready, caseSealed: false })).toMatchObject({ reason: 'not_sealed' });
  });

  it('refuses a case another firm already leads', () => {
    expect(canTakeCase({ ...ready, caseHasLead: true })).toMatchObject({ reason: 'already_taken' });
  });

  it('refuses a lawyer who is not admitted where the case is', () => {
    expect(canTakeCase({ ...ready, admittedInJurisdiction: false })).toMatchObject({
      reason: 'not_admitted',
    });
  });

  it('refuses a lawyer who is a claimant in the case', () => {
    expect(canTakeCase({ ...ready, isClaimant: true })).toMatchObject({ reason: 'is_claimant' });
  });

  it('refuses a firm that has not confirmed its conflict check', () => {
    expect(canTakeCase({ ...ready, conflictsConfirmed: false })).toMatchObject({
      reason: 'conflicts_not_confirmed',
    });
  });

  it('refuses a lawyer who holds the most open cases', () => {
    expect(canTakeCase({ ...ready, openCases: maxOpenCasesPerLawyer })).toMatchObject({
      reason: 'at_capacity',
    });
  });

  it('allows a lawyer one case below the limit', () => {
    expect(canTakeCase({ ...ready, openCases: maxOpenCasesPerLawyer - 1 })).toStrictEqual({
      ok: true,
    });
  });

  it('reports the first failing check when several fail', () => {
    expect(canTakeCase({ ...ready, verified: false, openCases: 99 })).toMatchObject({
      reason: 'not_verified',
    });
  });
});

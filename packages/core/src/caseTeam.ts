/**
 * The most open cases one lawyer can hold through Celia at a time. No rule sets a number (ABA Formal Opinion 06-441 asks only
 * that a lawyer decline work they cannot do competently), so this is a product guardrail, not a legal limit. See
 * docs/research/taking-a-case.md.
 */
export const maxOpenCasesPerLawyer = 5;

export type TakeCaseInput = {
  /** Staff have checked the lawyer's registration. */
  verified: boolean;
  /** The case has a sealed evidence file, so it is ready for counsel. */
  caseSealed: boolean;
  /** Another firm already leads the case. */
  caseHasLead: boolean;
  /** The lawyer is admitted where the case is. */
  admittedInJurisdiction: boolean;
  /** The lawyer is a claimant in the case. */
  isClaimant: boolean;
  /** The firm confirmed it checked conflicts for the whole firm. */
  conflictsConfirmed: boolean;
  /** How many open cases the lawyer already holds. */
  openCases: number;
};

export type TakeCaseRefusal =
  | 'not_verified'
  | 'not_sealed'
  | 'already_taken'
  | 'not_admitted'
  | 'is_claimant'
  | 'conflicts_not_confirmed'
  | 'at_capacity';

/**
 * Decides whether a lawyer's firm can take a case. The checks run in order and the first one that fails is the reason, so the
 * lawyer is told one thing to fix at a time. Whether a firm has a real conflict is the firm's duty: this only requires that it
 * confirmed the check.
 * @param input - What is known about the lawyer and the case.
 * @returns `ok`, or the first reason the firm cannot take it.
 */
export function canTakeCase(
  input: TakeCaseInput,
): { ok: true } | { ok: false; reason: TakeCaseRefusal } {
  const refusals: [boolean, TakeCaseRefusal][] = [
    [!input.verified, 'not_verified'],
    [!input.caseSealed, 'not_sealed'],
    [input.caseHasLead, 'already_taken'],
    [!input.admittedInJurisdiction, 'not_admitted'],
    [input.isClaimant, 'is_claimant'],
    [!input.conflictsConfirmed, 'conflicts_not_confirmed'],
    [input.openCases >= maxOpenCasesPerLawyer, 'at_capacity'],
  ];
  const refused = refusals.find(([fails]) => fails);

  return refused ? { ok: false, reason: refused[1] } : { ok: true };
}

import { getJurisdiction } from '@celia/jurisdictions';

/**
 * Whether a lawyer is admitted where a case is. A lawyer admitted in a state or region counts for a case in its country,
 * and a lawyer admitted in a country counts for a case in one of its states or regions.
 * @param admittedIn - The jurisdiction ids the lawyer is admitted in.
 * @param caseJurisdiction - The jurisdiction id of the case.
 * @returns True when one of them is the case's jurisdiction or is within it, or contains it.
 */
export function isAdmittedFor(admittedIn: string[], caseJurisdiction: string) {
  const caseParent = getJurisdiction(caseJurisdiction)?.parent?.id;

  return admittedIn.some(
    (id) =>
      id === caseJurisdiction ||
      id === caseParent ||
      getJurisdiction(id)?.parent?.id === caseJurisdiction,
  );
}

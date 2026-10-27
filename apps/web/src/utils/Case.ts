export const caseStatuses = ['collecting', 'building', 'sealed', 'counsel'] as const;

/** Where a case stands: still collecting claims, building evidence, sealed for counsel, or taken by a firm. */
export type CaseStatus = (typeof caseStatuses)[number];

/** What the case bank shows about one case. A summary only: no claimant detail. */
export type CaseRow = {
  id: string;
  number: string;
  name: string;
  /** A jurisdiction id from `@celia/jurisdictions`. */
  jurisdiction: string;
  claimants: number;
  status: CaseStatus;
  /** Whether an analysis report has been saved for the case. */
  hasReport: boolean;
  /** ISO timestamp of the last change. */
  updatedAt: string;
};

/**
 * Formats a case's running number for people, as in `CB-0142`.
 * @param seq - The case's sequence number.
 * @returns The case number.
 */
export function caseNumber(seq: number) {
  return `CB-${String(seq).padStart(4, '0')}`;
}

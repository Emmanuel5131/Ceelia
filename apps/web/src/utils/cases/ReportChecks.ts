import type { CheckResult, Report } from '@/validations/ReportValidation';

/** One check of a report as a row for staff: what the platform said, the result, what the chain shows, and the notebooks behind it. */
export type CheckRow = {
  /** The check's place in the report, which names its row. */
  id: string;
  claim: string;
  result: CheckResult;
  evidence: string;
  /** The tests that back the check, each with a link to its output. Empty when the check has no notebook yet. */
  notebooks: { id: string; title: string; href: string }[];
};

/**
 * The checks of a report as table rows, so staff can see which checks have a notebook behind them and which still need research.
 * @param report - The report's checks and tests.
 * @param href - Makes the link to a test's output from its id.
 * @returns One row for each check, in the order of the report.
 */
export function checkRows(
  report: Pick<Report, 'checks' | 'tests'>,
  href: (testId: string) => string,
): CheckRow[] {
  return report.checks.map((check, index) => ({
    id: String(index),
    claim: check.claim,
    result: check.result,
    evidence: check.evidence,
    notebooks: (check.tests ?? []).map((id) => ({
      id,
      title: report.tests.find((test) => test.id === id)?.title ?? id,
      href: href(id),
    })),
  }));
}

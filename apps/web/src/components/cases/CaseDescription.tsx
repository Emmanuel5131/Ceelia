/**
 * The description of a case, written to the case itself from its report. Before a case has one, the report's headline stands in,
 * and with neither there is nothing to show.
 * @param props - The description props.
 * @param props.description - The case's description.
 * @param props.headline - The report's headline, when there is a report.
 * @returns The description, or nothing.
 */
export function CaseDescription(props: { description: string | null; headline?: string }) {
  const text = props.description ?? props.headline;

  return text ? <p className="text-base whitespace-pre-line">{text}</p> : null;
}

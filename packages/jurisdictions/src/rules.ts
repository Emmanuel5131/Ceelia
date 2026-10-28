import type { RuleKind, RuleMode } from './types';

/** The four kinds of rule, with what each asks for and what Celia does about it. */
export const ruleKinds: RuleKind[] = [
  { id: 'certificate', title: 'Certificate', text: 'The person responsible for the system certifies how the record was made.', answer: 'Our certificate names the system, the time and the method.' },
  { id: 'authentication', title: 'Authentication', text: 'You show the record is what it claims to be and that the system kept it intact.', answer: 'The report is hashed against the commitment, so any change shows.' },
  { id: 'presumption', title: 'Presumption', text: 'The system is presumed to have worked unless someone challenges it.', answer: 'The method was fixed before any data was touched.' },
  { id: 'equal', title: 'Equal treatment', text: 'A record can’t be refused only because it is electronic.', answer: 'Every finding states what is proven and what is not.' },
];

const byId = new Map<RuleMode, RuleKind>(ruleKinds.map((k) => [k.id, k]));

/**
 * Looks up one of the four kinds of rule.
 * @param mode - The rule mode.
 * @returns The title, description and Celia's answer for that mode.
 */
export function getRuleKind(mode: RuleMode): RuleKind {
  return byId.get(mode)!;
}

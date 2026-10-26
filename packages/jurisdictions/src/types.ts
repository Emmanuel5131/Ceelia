/** The four shapes a court's rule for electronic records takes. */
export type RuleMode = 'certificate' | 'authentication' | 'presumption' | 'equal';

/**
 * How sure we are about a jurisdiction.
 * - `built`: Celia's certificate is built to this rule.
 * - `mapped`: a rule is mapped from public sources; counsel has not confirmed it.
 * - `inherited`: a state, province or region. It uses the national rule of its country.
 * - `none`: nothing is mapped yet. We never guess.
 */
export type JurisdictionStatus = 'built' | 'mapped' | 'inherited' | 'none';

export type RuleKind = {
  id: RuleMode;
  title: string;
  /** What the rule asks for, in plain words. */
  text: string;
  /** What Celia does about it. */
  answer: string;
};

export type Jurisdiction = {
  /** Lowercase ISO 3166 code, for example `ng` or `us-ny`. Custom entries use a short slug. */
  id: string;
  name: string;
  /** The country this sits in, for states, provinces and regions. */
  parent?: { id: string; name: string };
  /** `country`, or the local word for it: state, province, region, county and so on. */
  kind: string;
  mode: RuleMode | null;
  law: string | null;
  status: JurisdictionStatus;
};

/**
 * What kind of loss a claim is about, in the words a victim would use rather than a legal label. Ordered by how much the
 * FBI and Chainalysis report is lost to each (see docs/research/fraud-types-and-claim-form.md). Pig butchering is an
 * `investment_platform` that began as an `impersonation`; the contact channel records how it started.
 */
export const fraudTypes = [
  'investment_platform',
  'rug_pull',
  'exchange_service',
  'impersonation',
  'recovery_scam',
  'wallet_drained',
  'other',
] as const;

export type FraudType = (typeof fraudTypes)[number];

/** How the money left the victim. Only `wallet` can be proven by signing; the rest are backed by a transaction hash. */
export const paymentMethods = ['wallet', 'exchange', 'atm', 'p2p'] as const;

export type PaymentMethod = (typeof paymentMethods)[number];

/** How the victim first met the operator. Optional: it shows patterns and the reliance a lawyer needs. */
export const contactChannels = [
  'social_dating',
  'messaging',
  'ad_influencer',
  'referral',
  'call_text_email',
  'search',
  'other',
] as const;

export type ContactChannel = (typeof contactChannels)[number];

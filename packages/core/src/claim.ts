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
  'address_poisoning',
  'honeypot_token',
  'extortion',
  'fake_job',
  'account_takeover',
  'romance_scam',
  'phishing',
  'hack_exploit',
  'other',
] as const;

export type FraudType = (typeof fraudTypes)[number];

/**
 * How the money left the victim. Only `wallet` can be proven by signing. The other ways on a chain may be backed by a
 * transaction hash when the person has one; `bank_card` and `cash` never touch a chain, so they ask for no chain or hash.
 */
export const paymentMethods = [
  'wallet',
  'exchange',
  'atm',
  'p2p',
  'bank_card',
  'cash',
  'other',
] as const;

export type PaymentMethod = (typeof paymentMethods)[number];

/**
 * Whether the money moved on a chain, so a chain, a transaction and an address mean something. Paying by bank transfer, card or
 * cash does not.
 * @param method - How the money was paid.
 * @returns False for a bank, card or cash payment.
 */
export function paidOnChain(method: PaymentMethod) {
  return method !== 'bank_card' && method !== 'cash';
}

/**
 * How the wallet the money left from is kept, when it was their own. Optional: it shows how a loss happens, such as a drainer.
 */
export const walletTypes = ['browser_extension', 'mobile_app', 'hardware', 'other'] as const;

export type WalletType = (typeof walletTypes)[number];

/**
 * What kind of account the wallet address is on its chain, read from the chain when the claim is filed, never asked: an `eoa`
 * (a regular wallet held by a key) or a `contract` (a smart contract wallet, such as a multisig).
 */
export const accountKinds = ['eoa', 'contract'] as const;

export type AccountKind = (typeof accountKinds)[number];

/**
 * The named wallet the money left from, when it was their own. Brand names, so they are not translated. Optional: it shows which
 * apps are being targeted.
 */
export const walletApps = [
  'metamask',
  'phantom',
  'trust_wallet',
  'coinbase_wallet',
  'binance_wallet',
  'okx_wallet',
  'exodus',
  'rabby',
  'rainbow',
  'safe',
  'tronlink',
  'tonkeeper',
  'ledger',
  'trezor',
  'other',
] as const;

export type WalletApp = (typeof walletApps)[number];

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

import { useTranslations } from 'next-intl';

/**
 * The words for the choices on a claim: what happened, how it was paid and how it started. They are plain language on
 * purpose; the legal labels belong to counsel.
 * @returns The labels and the statement hints, keyed by choice.
 */
export function useClaimLabels() {
  const t = useTranslations('ClaimPage');

  return {
    fraudType: {
      investment_platform: t('type_investment_platform'),
      rug_pull: t('type_rug_pull'),
      exchange_service: t('type_exchange_service'),
      impersonation: t('type_impersonation'),
      recovery_scam: t('type_recovery_scam'),
      wallet_drained: t('type_wallet_drained'),
      address_poisoning: t('type_address_poisoning'),
      honeypot_token: t('type_honeypot_token'),
      extortion: t('type_extortion'),
      fake_job: t('type_fake_job'),
      account_takeover: t('type_account_takeover'),
      romance_scam: t('type_romance_scam'),
      phishing: t('type_phishing'),
      hack_exploit: t('type_hack_exploit'),
      other: t('type_other'),
    },
    fraudTypeText: {
      investment_platform: t('type_investment_platform_text'),
      rug_pull: t('type_rug_pull_text'),
      exchange_service: t('type_exchange_service_text'),
      impersonation: t('type_impersonation_text'),
      recovery_scam: t('type_recovery_scam_text'),
      wallet_drained: t('type_wallet_drained_text'),
      address_poisoning: t('type_address_poisoning_text'),
      honeypot_token: t('type_honeypot_token_text'),
      extortion: t('type_extortion_text'),
      fake_job: t('type_fake_job_text'),
      account_takeover: t('type_account_takeover_text'),
      romance_scam: t('type_romance_scam_text'),
      phishing: t('type_phishing_text'),
      hack_exploit: t('type_hack_exploit_text'),
      other: t('type_other_text'),
    },
    statementHint: {
      investment_platform: t('hint_investment_platform'),
      rug_pull: t('hint_rug_pull'),
      exchange_service: t('hint_exchange_service'),
      impersonation: t('hint_impersonation'),
      recovery_scam: t('hint_recovery_scam'),
      wallet_drained: t('hint_wallet_drained'),
      address_poisoning: t('hint_address_poisoning'),
      honeypot_token: t('hint_honeypot_token'),
      extortion: t('hint_extortion'),
      fake_job: t('hint_fake_job'),
      account_takeover: t('hint_account_takeover'),
      romance_scam: t('hint_romance_scam'),
      phishing: t('hint_phishing'),
      hack_exploit: t('hint_hack_exploit'),
      other: t('hint_other'),
    },
    // Brand names are the same in every language; only "other" is translated.
    walletApp: {
      metamask: 'MetaMask',
      phantom: 'Phantom',
      trust_wallet: 'Trust Wallet',
      coinbase_wallet: 'Coinbase Wallet',
      binance_wallet: 'Binance Web3 Wallet',
      okx_wallet: 'OKX Wallet',
      exodus: 'Exodus',
      rabby: 'Rabby',
      rainbow: 'Rainbow',
      safe: 'Safe',
      tronlink: 'TronLink',
      tonkeeper: 'Tonkeeper',
      ledger: 'Ledger',
      trezor: 'Trezor',
      other: t('wallet_other'),
    },
    walletType: {
      browser_extension: t('wallet_browser_extension'),
      mobile_app: t('wallet_mobile_app'),
      hardware: t('wallet_hardware'),
      other: t('wallet_other'),
    },
    accountKind: {
      eoa: t('account_kind_eoa'),
      contract: t('account_kind_contract'),
    },
    paymentMethod: {
      wallet: t('pay_wallet'),
      exchange: t('pay_exchange'),
      atm: t('pay_atm'),
      p2p: t('pay_p2p'),
      bank_card: t('pay_bank_card'),
      other: t('pay_other'),
    },
    contactChannel: {
      social_dating: t('contact_social_dating'),
      messaging: t('contact_messaging'),
      ad_influencer: t('contact_ad_influencer'),
      referral: t('contact_referral'),
      call_text_email: t('contact_call_text_email'),
      search: t('contact_search'),
      other: t('contact_other'),
    },
  };
}

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
      other: t('type_other'),
    },
    fraudTypeText: {
      investment_platform: t('type_investment_platform_text'),
      rug_pull: t('type_rug_pull_text'),
      exchange_service: t('type_exchange_service_text'),
      impersonation: t('type_impersonation_text'),
      recovery_scam: t('type_recovery_scam_text'),
      wallet_drained: t('type_wallet_drained_text'),
      other: t('type_other_text'),
    },
    statementHint: {
      investment_platform: t('hint_investment_platform'),
      rug_pull: t('hint_rug_pull'),
      exchange_service: t('hint_exchange_service'),
      impersonation: t('hint_impersonation'),
      recovery_scam: t('hint_recovery_scam'),
      wallet_drained: t('hint_wallet_drained'),
      other: t('hint_other'),
    },
    paymentMethod: {
      wallet: t('pay_wallet'),
      exchange: t('pay_exchange'),
      atm: t('pay_atm'),
      p2p: t('pay_p2p'),
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

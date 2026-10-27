import type { FraudType } from '@celia/core';
import { useTranslations } from 'next-intl';
import type { ReportedPattern as Pattern } from '@/libs/CaseClaims';

/**
 * What may have happened, in the claimants' own terms: the kind of loss most of them report. It is their account, counted, and
 * not a finding of fraud.
 * @param props - The pattern props.
 * @param props.pattern - The most reported kind of loss, or nothing when there is none to show.
 * @param props.note - Whether to show the note that this is not a finding. On by default; off where the page has its own.
 * @returns The line and its note, or nothing.
 */
export function ReportedPattern(props: { pattern: Pattern | null; note?: boolean }) {
  const t = useTranslations('ReportedPattern');

  if (!props.pattern) {
    return null;
  }

  const what: Record<FraudType, string> = {
    investment_platform: t('investment_platform'),
    rug_pull: t('rug_pull'),
    exchange_service: t('exchange_service'),
    impersonation: t('impersonation'),
    recovery_scam: t('recovery_scam'),
    wallet_drained: t('wallet_drained'),
    address_poisoning: t('address_poisoning'),
    honeypot_token: t('honeypot_token'),
    extortion: t('extortion'),
    fake_job: t('fake_job'),
    account_takeover: t('account_takeover'),
    romance_scam: t('romance_scam'),
    phishing: t('phishing'),
    hack_exploit: t('hack_exploit'),
    other: t('other'),
  };

  return (
    <section className="grid gap-2">
      <h3 className="text-lg">{t('title')}</h3>
      <p>
        {t('line', {
          count: props.pattern.count,
          total: props.pattern.total,
          what: what[props.pattern.type],
        })}
      </p>
      <p>
        {t('confirmation', {
          confirmed: props.pattern.confirmed,
          unconfirmed: props.pattern.total - props.pattern.confirmed,
        })}
      </p>
      {props.note !== false && <p className="text-sm text-ink-muted">{t('note')}</p>}
    </section>
  );
}

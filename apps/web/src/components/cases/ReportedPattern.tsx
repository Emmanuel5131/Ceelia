import type { FraudType } from '@celia/core';
import { useTranslations } from 'next-intl';
import type { ReportedPattern as Pattern } from '@/libs/cases/CaseClaims';

/**
 * The kind of loss most claimants report, in their own terms and counted, with how many staff have confirmed. It is their account,
 * not a finding of fraud.
 * @param props - The pattern props.
 * @param props.pattern - The most reported kind of loss, or nothing when there is none to show.
 * @param props.note - Whether to show the note that this is not a finding. On by default; off where the page has its own.
 * @param props.bare - Just the two lines, with no heading or note, for a page that tells it as part of a longer story.
 * @returns The section, or nothing.
 */
export function ReportedPattern(props: {
  pattern: Pattern | null;
  note?: boolean;
  bare?: boolean;
}) {
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

  const line = t('line', {
    count: props.pattern.count,
    total: props.pattern.total,
    what: what[props.pattern.type],
  });
  const confirmation = t('confirmation', {
    confirmed: props.pattern.confirmed,
    unconfirmed: props.pattern.total - props.pattern.confirmed,
  });

  if (props.bare) {
    return (
      <>
        <p>{line}</p>
        <p className="text-sm text-ink-muted">{confirmation}</p>
      </>
    );
  }

  return (
    <section className="grid gap-2">
      <h3 className="text-lg">{t('title')}</h3>
      <p>{line}</p>
      <p>{confirmation}</p>
      {props.note !== false && <p className="text-sm text-ink-muted">{t('note')}</p>}
    </section>
  );
}

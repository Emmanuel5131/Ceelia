import { useFormatter, useTranslations } from 'next-intl';
import { describeAmounts } from '@/utils/claims/Transaction';
import type { StoredCheck } from '@/utils/claims/Transaction';

/**
 * What the chain showed when a claim's transaction was checked, in one line for the lawyer: the amounts, when it happened, and
 * whether the claimant's wallet is the one that sent it (or received it). A claim whose transaction could not be checked shows
 * nothing. It is what the chain shows, not a finding about the claim.
 * @param props - The line props.
 * @param props.check - What was kept when the claim was saved.
 * @param props.expect - Whether the claimant's wallet should have sent the transaction or received it.
 * @returns The line, or nothing.
 */
export function ChainCheck(props: { check: StoredCheck | null; expect: 'sender' | 'recipient' }) {
  const t = useTranslations('CaseClaim');
  const format = useFormatter();
  const { check } = props;

  if (!check) {
    return null;
  }

  const checked = format.dateTime(new Date(check.checkedAt), { dateStyle: 'medium' });

  if (check.status === 'not_found' || !check.facts) {
    return <p className="text-sm text-ink-muted">{t('check_not_found', { date: checked })}</p>;
  }

  const parts = [
    ...describeAmounts(check.facts),
    ...(check.facts.at ? [format.dateTime(new Date(check.facts.at), { dateStyle: 'medium' })] : []),
    ...(check.facts.state === 'success' ? [] : [t(`check_state_${check.facts.state}`)]),
  ];
  const role =
    check.role === null
      ? null
      : t(`check_${props.expect}_${check.role === props.expect ? 'ok' : 'other'}`);

  return (
    <p className="text-sm text-ink-muted">
      {t('check_found', { details: parts.join(' · '), date: checked })} {role}
    </p>
  );
}

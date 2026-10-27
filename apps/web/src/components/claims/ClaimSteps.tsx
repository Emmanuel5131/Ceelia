import { useTranslations } from 'next-intl';
import { ClaimProgress } from '@/components/claims/ClaimProgress';
import type { StepState } from '@/utils/ClaimSteps';

/**
 * Where a claim stands, in one glance: a bar per step, filled for each one done, and the last thing done in words.
 * @param props - The steps props.
 * @param props.states - One state per step, from `claimSteps`.
 * @param props.signed - Whether this claim is proven by signing from a wallet; otherwise the transaction reference stands in.
 * @returns The bars and the latest step.
 */
export function ClaimSteps(props: { states: StepState[]; signed: boolean }) {
  const t = useTranslations('ClaimPage');
  const labels = [
    t('step_wallet'),
    props.signed ? t('step_ownership') : t('step_payment'),
    t('step_statement'),
    t('step_sent'),
    t('step_pooled'),
    t('step_counsel'),
  ];
  const done = props.states.filter((state) => state === 'done').length;

  return (
    <div className="grid gap-3">
      <ClaimProgress step={done} total={labels.length} />
      <p className="text-sm text-ink-muted">{labels[done - 1]}</p>
    </div>
  );
}

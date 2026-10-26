import { useTranslations } from 'next-intl';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import type { StepState } from '@/utils/ClaimSteps';

const markers = { done: 'filled', current: 'dashed', todo: 'muted' } as const;

/**
 * A claim step by step. The marker carries the state: filled = done, dashed = the step you are on, muted = not yet.
 * @param props - The steps props.
 * @param props.states - One state per step, from `claimSteps`.
 * @returns The list of steps.
 */
export function ClaimSteps(props: { states: StepState[] }) {
  const t = useTranslations('ClaimPage');
  const labels = [
    t('step_wallet'),
    t('step_ownership'),
    t('step_statement'),
    t('step_sent'),
    t('step_pooled'),
    t('step_counsel'),
  ];

  return (
    <Timeline>
      {labels.map((label, i) => {
        const state = props.states[i] ?? 'todo';

        return (
          <TimelineItem key={label} marker={markers[state]}>
            <p className={state === 'todo' ? 'text-ink-muted' : undefined}>{label}</p>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}

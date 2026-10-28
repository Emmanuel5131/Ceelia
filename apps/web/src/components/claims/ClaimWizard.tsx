'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/libs/I18nNavigation';
import type { StepState } from '@/utils/ClaimSteps';
import { cn } from '@/utils/Cn';

/** The parts of the claim page, in the order the person does them. */
export type WizardKey = 'ownership' | 'statement' | 'send';

// Where each part sits in the list `claimSteps` gives: the wallet is step 0, so the first part the person does is step 1.
const stateIndex = { ownership: 1, statement: 2, send: 3 } as const;

/**
 * The claim page, one step at a time, with the same bars as the claim form: one per step, the ones reached filled, each with its
 * name underneath and pressable. Only the step on show is visible, but every step stays on the page, so what was typed in one is
 * not lost when the person looks at another. Back and Continue move between them, and once the last step is done, Done goes back
 * to the claims.
 * @param props - The wizard props.
 * @param props.header - The title of the claim, which sits at the top of the left column so the box on the right starts on its line.
 * @param props.panels - The steps in order, each already built on the server, with the button that saves it, if it has one.
 *   Buttons sit under the box beside Back, not inside it.
 * @param props.states - One state per step of the claim, from `claimSteps`.
 * @param props.aside - What sits on the right, such as the summary of the claim.
 * @param props.start - The step to open on, when it is not simply the first one still to do.
 * @returns The page body.
 */
export function ClaimWizard(props: {
  header: React.ReactNode;
  panels: { key: WizardKey; panel: React.ReactNode; action?: React.ReactNode }[];
  states: StepState[];
  aside: React.ReactNode;
  start?: WizardKey;
}) {
  const t = useTranslations('ClaimPage');
  const keys = props.panels.map((entry) => entry.key);
  const isDone = (key: WizardKey) => props.states[stateIndex[key]] === 'done';
  // Open on the step asked for, or else the step still to do: the first one that is not done.
  const [active, setActive] = React.useState<WizardKey>(
    props.start ?? keys.find((key) => !isDone(key)) ?? keys[0] ?? 'statement',
  );
  const index = keys.indexOf(active);
  const previous = keys[index - 1];
  const next = keys[index + 1];

  return (
    <div className="mx-auto grid w-full max-w-5xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-6">
        {props.header}
        <nav aria-label={t('progress_title')}>
          <ol className="flex gap-2">
            {keys.map((key, position) => (
              <li key={key} className="flex-1" aria-current={key === active ? 'step' : undefined}>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-full flex-col items-stretch gap-2 px-0 py-1 text-left whitespace-normal hover:bg-transparent"
                  onClick={() => {
                    setActive(key);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className={cn('h-1 w-full', position <= index ? 'bg-ink' : 'bg-border')}
                  />
                  <span
                    className={cn('text-sm', key === active ? 'font-medium' : 'text-ink-muted')}
                  >
                    {t('step_of', { step: position + 1, total: keys.length })}
                    {': '}
                    {t(`wiz_${key}`)}
                    {isDone(key) ? ` · ${t('step_status_done')}` : ''}
                  </span>
                </Button>
              </li>
            ))}
          </ol>
        </nav>
        {props.panels.map((entry) => (
          <div key={entry.key} hidden={entry.key !== active}>
            {entry.panel}
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          {previous && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setActive(previous);
              }}
            >
              {t('back')}
            </Button>
          )}
          {props.panels.find((entry) => entry.key === active)?.action}
          {next && isDone(active) && (
            <Button
              type="button"
              onClick={() => {
                setActive(next);
              }}
            >
              {t('next')}
            </Button>
          )}
          {!next && isDone(active) && (
            <Button asChild>
              <Link href="/dashboard/claims">{t('step_status_done')}</Link>
            </Button>
          )}
        </div>
      </div>
      <aside className="grid gap-6 lg:sticky lg:top-8">{props.aside}</aside>
    </div>
  );
}

'use client';

import { TaskChooseOrganization, useClerk } from '@clerk/nextjs';
import { BuildingsIcon, UserIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ChoiceCards } from '@/components/ui/choice-cards';
import type { ChoiceOption } from '@/components/ui/choice-cards';

type Kind = 'individual' | 'organization';

/**
 * The first question after signing in: is the person here as an individual, or for an organization such as a law firm or an agency?
 * An individual goes straight on without an organization. An organization creates one, or joins one they were invited to, with
 * Clerk's own form.
 * @param props - The choice props.
 * @param props.next - Where to go once this step is done: the next onboarding step.
 * @returns The choice, and the organization form once that is chosen.
 */
export function OrganizationChoice(props: { next: string }) {
  const t = useTranslations('OrganizationStep');
  const clerk = useClerk();
  const [kind, setKind] = React.useState<Kind | undefined>();
  const [pending, startTransition] = React.useTransition();
  const [failed, setFailed] = React.useState(false);
  const options: ChoiceOption<Kind>[] = [
    {
      value: 'individual',
      title: t('individual_title'),
      description: t('individual_text'),
      icon: <UserIcon aria-hidden="true" />,
    },
    {
      value: 'organization',
      title: t('organization_title'),
      description: t('organization_text'),
      icon: <BuildingsIcon aria-hidden="true" />,
    },
  ];

  return (
    <div className="grid gap-6">
      <ChoiceCards
        name="kind"
        label={t('label')}
        options={options}
        value={kind}
        onChange={(next) => {
          setKind(next);
          setFailed(false);
        }}
      />
      {kind === 'individual' && (
        <div className="grid justify-items-start gap-2">
          <Button
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                // Without an organization the session is still good; this only tells Clerk the person chose to have none.
                try {
                  await clerk.setActive({ organization: null, redirectUrl: props.next });
                } catch {
                  setFailed(true);
                }
              });
            }}
          >
            {t('continue')}
          </Button>
          {failed && (
            <p role="alert" className="text-sm text-seal">
              {t('error_individual')}
            </p>
          )}
        </div>
      )}
      {kind === 'organization' && <TaskChooseOrganization redirectUrlComplete={props.next} />}
    </div>
  );
}

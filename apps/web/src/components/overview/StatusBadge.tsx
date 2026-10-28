'use client';

import { GavelIcon, SealCheckIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { CaseStatus } from '@/utils/cases/Case';

const variants = {
  collecting: 'dashed',
  building: 'default',
  sealed: 'solid',
  counsel: 'muted',
} as const;

/**
 * A case's status. State is shown by shape and a label, never by colour alone: dashed = still collecting, outlined = being built,
 * filled = sealed, and the gavel marks a case a lawyer or firm has taken. Hover or focus shows what the status means.
 * @param props - The badge props.
 * @param props.status - The case status.
 * @returns The status tag with its explanation.
 */
export function StatusBadge(props: { status: CaseStatus }) {
  const t = useTranslations('CaseBank');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={variants[props.status]}
          tabIndex={0}
          className={props.status === 'counsel' ? 'text-ink' : undefined}
        >
          {props.status === 'sealed' && <SealCheckIcon aria-hidden="true" />}
          {props.status === 'counsel' && <GavelIcon aria-hidden="true" />}
          {t(`status_${props.status}`)}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{t(`status_${props.status}_hint`)}</TooltipContent>
    </Tooltip>
  );
}

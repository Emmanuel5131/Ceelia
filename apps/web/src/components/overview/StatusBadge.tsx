'use client';

import { GavelIcon, SealCheckIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { CaseStatus } from '@/libs/OverviewSample';

/**
 * A case's status. State is shown by shape and a label, never by colour alone: dashed = still collecting, outlined = being built,
 * filled = sealed, and the gavel marks a case a lawyer or firm has taken.
 * @param props - The badge props.
 * @param props.status - The case status.
 * @returns The status tag.
 */
export function StatusBadge(props: { status: CaseStatus }) {
  const t = useTranslations('CaseBank');

  if (props.status === 'collecting') {
    return <Badge variant="dashed">{t('status_collecting')}</Badge>;
  }

  if (props.status === 'building') {
    return <Badge>{t('status_building')}</Badge>;
  }

  if (props.status === 'sealed') {
    return (
      <Badge variant="solid">
        <SealCheckIcon aria-hidden="true" />
        {t('status_sealed')}
      </Badge>
    );
  }

  return (
    <Badge variant="muted" className="text-ink">
      <GavelIcon aria-hidden="true" />
      {t('status_counsel')}
    </Badge>
  );
}

'use client';

import { getJurisdiction } from '@celia/jurisdictions';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { loadCasePreview } from '@/app/[locale]/(auth)/dashboard/cases/actions';
import { ReportedPattern } from '@/components/cases/ReportedPattern';
import { StatCard } from '@/components/overview/StatCard';
import { StatusBadge } from '@/components/overview/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Link } from '@/libs/I18nNavigation';
import type { CaseRow } from '@/utils/Case';
import { jurisdictionName } from '@/utils/JurisdictionName';

/**
 * The two estimates a preview shows as big numbers: wallets affected and what they lost to the platform.
 * @param props - The estimate props.
 * @param props.estimate - The report's estimate, when it has one.
 * @param props.pending - Whether the report is still loading.
 * @returns Two stat cards.
 */
function PreviewEstimate(props: {
  estimate?: { wallets: string; losses: string };
  pending: boolean;
}) {
  const t = useTranslations('CasePreview');
  const hint = props.pending || props.estimate ? undefined : t('not_estimated');
  const value = (text?: string) => (props.pending ? '…' : (text ?? '—'));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard label={t('estimated_wallets')} value={value(props.estimate?.wallets)} hint={hint} />
      <StatCard label={t('estimated_losses')} value={value(props.estimate?.losses)} hint={hint} />
    </div>
  );
}

/**
 * What the chain shows, from the case's description: each proven finding beside what the platform said. The estimate line is
 * left out because the cards above already show it. Before a case has a description, the report's headline stands in.
 * @param props - The findings props.
 * @param props.description - The case's description.
 * @param props.headline - The report's headline, when there is a report.
 * @returns The section, or nothing.
 */
function PreviewFindings(props: { description: string | null; headline?: string }) {
  const t = useTranslations('CasePreview');
  const prefix = 'The platform said: ';
  const findings = (props.description ?? '')
    .split('\n\n')
    .filter((paragraph) => paragraph.startsWith(prefix))
    .map((paragraph) => paragraph.slice(prefix.length));

  if (findings.length === 0) {
    return props.headline ? <p>{props.headline}</p> : null;
  }

  return (
    <section className="grid gap-3">
      <h3 className="text-lg">{t('chain_title')}</h3>
      <ul className="grid gap-3">
        {findings.map((finding) => (
          <li key={finding} className="grid gap-1 border-l-2 border-border pl-4">
            <p className="text-sm text-ink-muted">{t('platform_said')}</p>
            <p>{finding}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * A quick look at a case from the case bank, without leaving the list: its stage, the estimated wallets affected and losses, and
 * the report's headline. The report is fetched when the dialog opens, not for every row. From here the person can close, read
 * the full analysis, or open the case page to take it.
 * @param props - The dialog props.
 * @param props.row - The case.
 * @returns The Preview button and its dialog.
 */
export function CasePreviewDialog(props: { row: CaseRow }) {
  const t = useTranslations('CasePreview');
  const [preview, setPreview] = React.useState<Awaited<ReturnType<typeof loadCasePreview>>>();
  const [pending, startTransition] = React.useTransition();
  const { row } = props;
  const jurisdiction = getJurisdiction(row.jurisdiction);
  const report = preview?.report;
  const estimate = report?.snapshot.estimate;
  return (
    <Dialog
      onOpenChange={(open) => {
        // Load once, when first opened.
        if (open && preview === undefined) {
          startTransition(async () => {
            setPreview(await loadCasePreview(row.id));
          });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t('preview')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
            <DialogTitle>{row.name}</DialogTitle>
            <StatusBadge status={row.status} />
          </div>
          <DialogDescription>
            <span className="font-mono">{row.number}</span>
            {' · '}
            {jurisdiction ? jurisdictionName(jurisdiction) : row.jurisdiction}
          </DialogDescription>
        </DialogHeader>

        <PreviewEstimate estimate={estimate} pending={pending} />

        {!row.hasReport && <p className="text-ink-muted">{t('no_report')}</p>}
        <PreviewFindings description={row.description} headline={report?.snapshot.headline} />
        <ReportedPattern pattern={preview?.reported ?? null} note={false} />
        {(row.description ?? preview?.reported) && (
          <p className="text-sm text-ink-muted">{t('footnote')}</p>
        )}
        {!pending && preview === null && (
          <p role="alert" className="text-sm text-seal">
            {t('load_failed')}
          </p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('close')}</Button>
          </DialogClose>
          {row.hasReport && (
            <Button asChild variant="outline">
              <Link href={`/dashboard/cases/${row.id}/analysis`}>{t('analysis')}</Link>
            </Button>
          )}
          <Button asChild>
            <Link href={`/dashboard/cases/${row.id}`}>{t('open')}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { getJurisdiction } from '@celia/jurisdictions';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { loadCaseReport } from '@/app/[locale]/(auth)/dashboard/cases/actions';
import { ReportSummary } from '@/components/cases/ReportSummary';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/libs/I18nNavigation';
import type { ReportView } from '@/libs/Reports';
import type { CaseRow } from '@/utils/Case';
import { jurisdictionName } from '@/utils/JurisdictionName';

/**
 * A quick look at a case from the case bank, without leaving the list: its facts, then the analysis report with each check,
 * the method and the hash. The report is fetched when the dialog opens, not for every row. From here the person can close, or
 * open the case page to take it.
 * @param props - The dialog props.
 * @param props.row - The case.
 * @returns The Preview button and its dialog.
 */
export function CasePreviewDialog(props: { row: CaseRow }) {
  const t = useTranslations('CasePreview');
  const format = useFormatter();
  const [report, setReport] = React.useState<ReportView | null>();
  const [pending, startTransition] = React.useTransition();
  const { row } = props;
  const jurisdiction = getJurisdiction(row.jurisdiction);

  return (
    <Dialog
      onOpenChange={(open) => {
        // Load once, and only when there is a report to load.
        if (open && report === undefined && row.hasReport) {
          startTransition(async () => {
            setReport(await loadCaseReport(row.id));
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
          <DialogTitle>{row.name}</DialogTitle>
          <DialogDescription className="font-mono">{row.number}</DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <dt className="text-ink-muted">{t('jurisdiction')}</dt>
            <dd className="font-medium">
              {jurisdiction ? jurisdictionName(jurisdiction) : row.jurisdiction}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-ink-muted">{t('claimants')}</dt>
            <dd className="font-medium tabular-nums">{format.number(row.claimants)}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-ink-muted">{t('stage')}</dt>
            <dd>
              <StatusBadge status={row.status} />
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-ink-muted">{t('updated')}</dt>
            <dd className="font-medium">
              {format.dateTime(new Date(row.updatedAt), { dateStyle: 'medium' })}
            </dd>
          </div>
        </dl>

        <section className="grid gap-4">
          <h3 className="text-lg">{t('report_title')}</h3>
          {!row.hasReport && <p className="text-ink-muted">{t('no_report')}</p>}
          {row.hasReport && pending && (
            <div className="grid gap-3" aria-busy="true">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {row.hasReport && !pending && report && <ReportSummary report={report} />}
          {row.hasReport && !pending && report === null && (
            <p role="alert" className="text-sm text-seal">
              {t('load_failed')}
            </p>
          )}
        </section>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('close')}</Button>
          </DialogClose>
          <Button asChild>
            <Link href={`/dashboard/cases/${row.id}`}>{t('open')}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

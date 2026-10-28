'use client';

import { getJurisdiction } from '@celia/jurisdictions';
import { CaretLeftIcon, CaretRightIcon, ShieldCheckIcon } from '@phosphor-icons/react';
import type { Column } from '@tanstack/react-table';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import {
  approveApplication,
  markApplicationReady,
  rejectApplication,
  runApplicationLookups,
  setApplicationCheck,
} from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { createAppColumnHelper } from '@/components/data-table/table';
import type { TableFeatures } from '@/components/data-table/table';
import { ReviewContext } from '@/components/staff/review-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { ApplicationInReview } from '@/libs/accounts/Applications';
import { reviewChecks } from '@/utils/accounts/Institution';
import type { LookupResult, ReviewCheck } from '@/utils/accounts/Institution';
import { jurisdictionName } from '@/utils/cases/JurisdictionName';

function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2">
      <dt className="text-ink-muted">{props.label}</dt>
      <dd>{props.children}</dd>
    </div>
  );
}

function Lookup(props: { label: string; result: LookupResult }) {
  const t = useTranslations('Staff');

  return (
    <div className="grid gap-1">
      <p>
        <span className="text-ink-muted">{props.label}: </span>
        {t(`app_lookup_status_${props.result.status}`)}
      </p>
      {props.result.matches.length > 0 && (
        <ul className="grid gap-1 pl-4">
          {props.result.matches.map((match) => (
            <li key={`${match.name}${match.detail}`}>
              {match.link ? (
                <a
                  href={match.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 focus-ring"
                >
                  {match.name}
                </a>
              ) : (
                match.name
              )}
              <span className="text-ink-muted"> · {match.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Lookups(props: {
  item: ApplicationInReview;
  pending: boolean;
  run: (fn: () => Promise<unknown>) => void;
}) {
  const t = useTranslations('Staff');
  const format = useFormatter();
  const { lookups, lookedUpAt } = props.item;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          disabled={props.pending}
          onClick={() => {
            props.run(async () => {
              await runApplicationLookups(props.item.id);
            });
          }}
        >
          {t('app_lookup_run')}
        </Button>
        {lookedUpAt && (
          <span className="text-ink-muted">
            {t('app_lookup_when', {
              when: format.dateTime(new Date(lookedUpAt), {
                dateStyle: 'medium',
                timeStyle: 'short',
              }),
            })}
          </span>
        )}
      </div>
      {lookups && (
        <>
          <Lookup label={t('app_lookup_registry')} result={lookups.registry} />
          <Lookup label={t('app_lookup_sanctions')} result={lookups.sanctions} />
          <p className="text-ink-muted">{t('app_lookup_note')}</p>
        </>
      )}
    </div>
  );
}

function Checks(props: {
  item: ApplicationInReview;
  pending: boolean;
  run: (fn: () => Promise<unknown>) => void;
}) {
  const t = useTranslations('Staff');

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-ink-muted">{t('app_checks')}</legend>
      {reviewChecks.map((check: ReviewCheck) => (
        <div key={check} className="flex items-center gap-3">
          <Checkbox
            id={`${props.item.id}-${check}`}
            checked={props.item.checks[check] === true}
            disabled={props.pending}
            onCheckedChange={(next) => {
              props.run(async () => {
                await setApplicationCheck({ userId: props.item.id, check, value: next === true });
              });
            }}
          />
          <Label htmlFor={`${props.item.id}-${check}`} className="font-normal">
            {t(`app_check_${check}`)}
          </Label>
        </div>
      ))}
    </fieldset>
  );
}

function Decision(props: {
  item: ApplicationInReview;
  actorId: string;
  production: boolean;
  pending: boolean;
  run: (fn: () => Promise<unknown>) => void;
}) {
  const t = useTranslations('Staff');
  const [note, setNote] = React.useState('');
  const [rejecting, setRejecting] = React.useState(false);
  const [message, setMessage] = React.useState<
    'checks_incomplete' | 'not_ready' | 'same_person' | 'missing' | 'note' | null
  >(null);
  const { item } = props;
  const complete = reviewChecks.every((check) => item.checks[check] === true);
  const ready = item.readyBy !== null;
  // The one who marked it ready cannot approve it in production; the server enforces it, this only says so.
  const ownReady = ready && item.readyBy === props.actorId && props.production;

  return (
    <div className="grid gap-3">
      {message && (
        <p role="alert" className="text-seal">
          {t(`app_refusal_${message}`)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {!ready && (
          <Button
            size="sm"
            disabled={props.pending || !complete}
            onClick={() => {
              props.run(async () => {
                const result = await markApplicationReady(item.id);
                setMessage(result === 'ok' ? null : result);
              });
            }}
          >
            {t('app_mark_ready')}
          </Button>
        )}
        {ready && (
          <>
            <Badge variant="solid">{t('app_ready')}</Badge>
            <Button
              size="sm"
              disabled={props.pending || ownReady}
              onClick={() => {
                props.run(async () => {
                  const result = await approveApplication(item.id);
                  setMessage(result === 'ok' ? null : result);
                });
              }}
            >
              {t('app_approve')}
            </Button>
            {ownReady && <span className="text-ink-muted">{t('app_second_person')}</span>}
          </>
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={props.pending}
          onClick={() => {
            setRejecting(!rejecting);
          }}
        >
          {t('app_reject')}
        </Button>
      </div>
      {rejecting && (
        <div className="grid gap-2">
          <Label htmlFor={`${item.id}-note`}>{t('app_reject_note')}</Label>
          <Textarea
            id={`${item.id}-note`}
            value={note}
            maxLength={500}
            onChange={(event) => {
              setNote(event.target.value);
            }}
          />
          <Button
            size="sm"
            variant="outline"
            className="justify-self-start"
            disabled={props.pending || note.trim() === ''}
            onClick={() => {
              props.run(async () => {
                const result = await rejectApplication({ userId: item.id, note });
                setMessage(result === 'ok' ? null : result);
              });
            }}
          >
            {t('app_reject_confirm')}
          </Button>
        </div>
      )}
    </div>
  );
}

function Heading<TValue>(props: {
  id: 'applicant' | 'kind' | 'domain' | 'checks' | 'due';
  column: Column<TableFeatures, ApplicationInReview, TValue>;
}) {
  const t = useTranslations('Staff');

  return <DataTableColumnHeader column={props.column} title={t(`apps_col_${props.id}`)} />;
}

function Due(props: { item: ApplicationInReview }) {
  const t = useTranslations('Staff');
  const format = useFormatter();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-ink-muted">
        {format.dateTime(new Date(props.item.dueAt), { dateStyle: 'medium' })}
      </span>
      {props.item.overdue && <Badge variant="solid">{t('app_overdue')}</Badge>}
      {props.item.readyBy !== null && <Badge variant="dashed">{t('app_ready')}</Badge>}
    </div>
  );
}

function ReviewButton(props: { id: string }) {
  const t = useTranslations('Staff');
  const review = React.useContext(ReviewContext);

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        review?.open(props.id);
      }}
    >
      {t('apps_review')}
    </Button>
  );
}

function KindLabel(props: { kind: ApplicationInReview['kind'] }) {
  const t = useTranslations('Staff');

  return t(`app_kind_${props.kind}`);
}

function DomainLabel(props: { domain: ApplicationInReview['domain'] }) {
  const t = useTranslations('Staff');

  return t(`app_domain_${props.domain}`);
}

const ticked = (item: ApplicationInReview) =>
  reviewChecks.filter((check) => item.checks[check] === true).length;

const helper = createAppColumnHelper<ApplicationInReview>();

const columns = helper.columns([
  helper.accessor((row) => `${row.organisation ?? ''} ${row.name} ${row.email}`, {
    id: 'applicant',
    header: ({ column }) => <Heading id="applicant" column={column} />,
    cell: ({ row }) => (
      <div className="grid">
        <span className="font-medium">{row.original.organisation ?? '—'}</span>
        <span className="text-xs text-ink-muted">
          {[row.original.name, row.original.email].filter(Boolean).join(' · ')}
        </span>
      </div>
    ),
  }),
  helper.accessor('kind', {
    id: 'kind',
    header: ({ column }) => <Heading id="kind" column={column} />,
    cell: ({ getValue }) => <KindLabel kind={getValue()} />,
    filterFn: 'inSet',
  }),
  helper.accessor('domain', {
    id: 'domain',
    header: ({ column }) => <Heading id="domain" column={column} />,
    cell: ({ getValue }) => <DomainLabel domain={getValue()} />,
    filterFn: 'inSet',
  }),
  helper.accessor((row) => ticked(row), {
    id: 'checks',
    header: ({ column }) => <Heading id="checks" column={column} />,
    cell: ({ getValue }) => `${getValue()} / ${reviewChecks.length}`,
  }),
  helper.accessor('dueAt', {
    id: 'due',
    header: ({ column }) => <Heading id="due" column={column} />,
    cell: ({ row }) => <Due item={row.original} />,
  }),
  helper.display({
    id: 'review',
    header: () => null,
    cell: ({ row }) => <ReviewButton id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  }),
]);

function Review(props: {
  item: ApplicationInReview;
  actorId: string;
  production: boolean;
  position: { index: number; total: number };
  onMove: (step: -1 | 1) => void;
}) {
  const t = useTranslations('Staff');
  const format = useFormatter();
  const [pending, startTransition] = React.useTransition();
  const { item } = props;
  const run = (fn: () => Promise<unknown>) => {
    startTransition(async () => {
      await fn();
    });
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>{item.organisation ?? t('app_independent')}</SheetTitle>
        <SheetDescription>
          {t('wallets_position', { index: props.position.index + 1, total: props.position.total })}
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-5 overflow-y-auto px-4 text-sm">
        <dl className="grid gap-2">
          <Row label={t('app_person')}>
            {[item.name, item.email].filter(Boolean).join(' · ') || t('review_unknown')}
          </Row>
          <Row label={t('app_domain')}>{t(`app_domain_${item.domain}`)}</Row>
          <Row label={t('app_registration')}>{item.registrationNumber ?? '—'}</Row>
          <Row label={t('app_website')}>{item.website ?? '—'}</Row>
          {item.contactRole && <Row label={t('app_role')}>{item.contactRole}</Row>}
          <Row label={t('app_jurisdictions')}>
            {item.jurisdictions
              .map((id) => {
                const jurisdiction = getJurisdiction(id);

                return jurisdiction ? jurisdictionName(jurisdiction) : id;
              })
              .join(', ') || '—'}
          </Row>
          <Row label={t('app_dates')}>
            {format.dateTime(new Date(item.submittedAt), { dateStyle: 'medium' })}
            {' → '}
            {format.dateTime(new Date(item.dueAt), { dateStyle: 'medium' })}
          </Row>
        </dl>
        <Lookups item={item} pending={pending} run={run} />
        <Checks item={item} pending={pending} run={run} />
        <Decision
          item={item}
          actorId={props.actorId}
          production={props.production}
          pending={pending}
          run={run}
        />
      </div>
      <SheetFooter className="flex-row justify-end gap-2">
        <Button
          size="icon-sm"
          variant="outline"
          aria-label={t('queue_previous')}
          disabled={props.position.index === 0}
          onClick={() => {
            props.onMove(-1);
          }}
        >
          <CaretLeftIcon aria-hidden="true" />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          aria-label={t('queue_next')}
          disabled={props.position.index >= props.position.total - 1}
          onClick={() => {
            props.onMove(1);
          }}
        >
          <CaretRightIcon aria-hidden="true" />
        </Button>
      </SheetFooter>
    </>
  );
}

/**
 * The applications waiting for review, as a table that sorts and filters, oldest first. Open one to review it in a side panel: what
 * the applicant gave, whether their work email is on the organisation's own domain, the lookups and six checks, and the decision.
 * A person marks it ready and a second person approves, or either rejects with a reason, so there is no bulk approve here. The
 * server checks every step again.
 * @param props - The table props.
 * @param props.items - The applications in review.
 * @param props.actorId - The signed-in staff member, so the panel can say who may approve.
 * @param props.production - Whether this is production, where the same person cannot mark ready and approve.
 * @returns The table and the side panel.
 */
export function ApplicationsTable(props: {
  items: ApplicationInReview[];
  actorId: string;
  production: boolean;
}) {
  const t = useTranslations('Staff');
  const [openId, setOpenId] = React.useState<string | null>(null);
  const index = props.items.findIndex((item) => item.id === openId);
  const current = index === -1 ? undefined : props.items[index];

  return (
    <ReviewContext value={{ open: setOpenId }}>
      <DataTable
        columns={columns}
        data={props.items}
        getRowId={(row) => row.id}
        pageSize={25}
        searchPlaceholder={t('apps_search')}
        labels={{
          applicant: t('apps_col_applicant'),
          kind: t('apps_col_kind'),
          domain: t('apps_col_domain'),
          checks: t('apps_col_checks'),
          due: t('apps_col_due'),
        }}
        filters={[
          {
            columnId: 'kind',
            title: t('apps_col_kind'),
            options: (['law_firm', 'investigative', 'other'] as const).map((value) => ({
              value,
              label: t(`app_kind_${value}`),
            })),
          },
          {
            columnId: 'domain',
            title: t('apps_col_domain'),
            options: (['own', 'free', 'different', 'unknown'] as const).map((value) => ({
              value,
              label: t(`app_domain_${value}`),
            })),
          },
        ]}
        empty={
          <Empty className="border border-border bg-surface">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldCheckIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>{t('queue_empty_title')}</EmptyTitle>
              <EmptyDescription>{t('queue_empty_text')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      />
      <Sheet
        open={current !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setOpenId(null);
          }
        }}
      >
        <SheetContent className="sm:max-w-xl">
          {current && (
            <Review
              key={current.id}
              item={current}
              actorId={props.actorId}
              production={props.production}
              position={{ index, total: props.items.length }}
              onMove={(step) => {
                setOpenId(props.items[index + step]?.id ?? null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </ReviewContext>
  );
}

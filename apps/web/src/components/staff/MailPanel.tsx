'use client';

import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { allowMail, retryMail } from '@/app/[locale]/(auth)/dashboard/staff/actions';
import { DataTable } from '@/components/data-table/DataTable';
import { createAppColumnHelper } from '@/components/data-table/table';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import type { FailedMail, SuppressedAddress } from '@/libs/notifications/MailStatus';

function Heading(props: { id: 'type' | 'error' | 'tries' | 'when' | 'email' | 'reason' }) {
  const t = useTranslations('Staff');

  return t(`mail_col_${props.id}`);
}

function When(props: { value: string }) {
  const format = useFormatter();

  return format.dateTime(new Date(props.value), { dateStyle: 'medium', timeStyle: 'short' });
}

function ActionButton(props: { label: string; run: () => Promise<void> }) {
  const [pending, startTransition] = React.useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(props.run);
      }}
    >
      {props.label}
    </Button>
  );
}

function Retry(props: { id: string }) {
  const t = useTranslations('Staff');

  return (
    <ActionButton
      label={t('mail_retry')}
      run={async () => {
        await retryMail(props.id);
      }}
    />
  );
}

function Allow(props: { email: string }) {
  const t = useTranslations('Staff');

  return (
    <ActionButton
      label={t('mail_allow')}
      run={async () => {
        await allowMail(props.email);
      }}
    />
  );
}

const failedHelper = createAppColumnHelper<FailedMail>();

const failedColumns = failedHelper.columns([
  failedHelper.accessor('type', { id: 'type', header: () => <Heading id="type" /> }),
  failedHelper.accessor('lastError', {
    id: 'error',
    header: () => <Heading id="error" />,
    cell: ({ getValue }) => <span className="text-sm text-ink-muted">{getValue()}</span>,
  }),
  failedHelper.accessor('attempts', { id: 'tries', header: () => <Heading id="tries" /> }),
  failedHelper.accessor('createdAt', {
    id: 'when',
    header: () => <Heading id="when" />,
    cell: ({ getValue }) => <When value={getValue()} />,
  }),
  failedHelper.display({
    id: 'retry',
    header: () => null,
    cell: ({ row }) => <Retry id={row.original.id} />,
    enableHiding: false,
  }),
]);

const suppressedHelper = createAppColumnHelper<SuppressedAddress>();

const suppressedColumns = suppressedHelper.columns([
  suppressedHelper.accessor('email', { id: 'email', header: () => <Heading id="email" /> }),
  suppressedHelper.accessor('reason', { id: 'reason', header: () => <Heading id="reason" /> }),
  suppressedHelper.accessor('createdAt', {
    id: 'when',
    header: () => <Heading id="when" />,
    cell: ({ getValue }) => <When value={getValue()} />,
  }),
  suppressedHelper.display({
    id: 'allow',
    header: () => null,
    cell: ({ row }) => <Allow email={row.original.email} />,
    enableHiding: false,
  }),
]);

function None(props: { title: string; text: string }) {
  return (
    <Empty className="border border-border bg-surface">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <EnvelopeSimpleIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{props.title}</EmptyTitle>
        <EmptyDescription>{props.text}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

/**
 * The failed emails, each with a Retry button, and the addresses we stopped mailing, each with an Allow button. Both are
 * short, read-only lists with an action per row.
 * @param props - The panel props.
 * @param props.failures - The latest failed messages.
 * @param props.suppressed - The suppressed addresses.
 * @returns The two tables.
 */
export function MailPanel(props: { failures: FailedMail[]; suppressed: SuppressedAddress[] }) {
  const t = useTranslations('Staff');

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <h3 className="text-base font-medium">{t('mail_failed_title')}</h3>
        <DataTable
          columns={failedColumns}
          data={props.failures}
          getRowId={(row) => row.id}
          toolbar={false}
          pagination={false}
          pageSize={100}
          empty={<None title={t('mail_failed_empty_title')} text={t('mail_failed_empty_text')} />}
        />
      </div>
      <div className="grid gap-3">
        <h3 className="text-base font-medium">{t('mail_suppressed_title')}</h3>
        <DataTable
          columns={suppressedColumns}
          data={props.suppressed}
          getRowId={(row) => row.email}
          toolbar={false}
          pagination={false}
          pageSize={100}
          empty={
            <None title={t('mail_suppressed_empty_title')} text={t('mail_suppressed_empty_text')} />
          }
        />
      </div>
    </div>
  );
}

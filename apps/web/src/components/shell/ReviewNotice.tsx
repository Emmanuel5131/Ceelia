import { InfoIcon } from '@phosphor-icons/react/ssr';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Link } from '@/libs/I18nNavigation';

/**
 * Shown to an applicant whose application is not approved yet. It says what is locked and what is not, when we received the
 * application and when we aim to decide; a rejected application shows the reason instead.
 * @param props - The notice props.
 * @param props.application - Where the application stands, when there is one on record.
 * @returns The notice.
 */
export async function ReviewNotice(props: {
  application?: {
    status: string;
    submittedAt: Date;
    reviewDueAt: Date;
    overdue: boolean;
    decisionNote: string | null;
    canReapply: boolean;
    reapplyOn: Date | null;
  };
}) {
  const t = await getTranslations('AppShell');
  const format = await getFormatter();
  const { application } = props;
  const day = (date: Date) => format.dateTime(date, { dateStyle: 'medium' });

  return (
    <output className="mb-8 grid gap-1 border border-border bg-paper px-4 py-3 text-sm text-ink-muted">
      <span className="flex items-start gap-3">
        <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {application?.status === 'rejected'
          ? t('review_rejected', { note: application.decisionNote ?? '' })
          : t('review_pending')}
      </span>
      {application?.status === 'rejected' && (
        <span className="pl-7">
          {application.canReapply ? (
            <Link
              href="/dashboard/apply-again"
              className="font-medium text-ink underline underline-offset-4 focus-ring"
            >
              {t('review_reapply_action')}
            </Link>
          ) : (
            application.reapplyOn && t('review_reapply_on', { date: day(application.reapplyOn) })
          )}
        </span>
      )}
      {application?.status === 'in_review' && (
        <span className="pl-7">
          {application.overdue
            ? t('review_overdue')
            : t('review_due', {
                submitted: day(application.submittedAt),
                due: day(application.reviewDueAt),
              })}
        </span>
      )}
    </output>
  );
}

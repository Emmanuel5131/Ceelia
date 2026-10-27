import { CheckIcon, MinusIcon, QuestionIcon, XIcon } from '@phosphor-icons/react/ssr';
import { useFormatter, useTranslations } from 'next-intl';
import { StatCard } from '@/components/overview/StatCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import type { ReportView } from '@/libs/Reports';
import type { CheckResult } from '@/validations/ReportValidation';

// Each result has its own shape as well as its label, so the result never rests on colour alone.
const resultTags = {
  proven: { variant: 'solid', Icon: CheckIcon },
  partly_proven: { variant: 'default', Icon: MinusIcon },
  not_proven: { variant: 'dashed', Icon: XIcon },
  not_checkable: { variant: 'muted', Icon: QuestionIcon },
} as const;

/**
 * A check's result as a tag: filled = proven, outlined with a dash = partly proven, dashed = not proven, plain = the chain
 * cannot show it.
 * @param props - The tag props.
 * @param props.result - The result.
 * @returns The tag.
 */
function ResultBadge(props: { result: CheckResult }) {
  const t = useTranslations('Report');
  const { variant, Icon } = resultTags[props.result];

  return (
    <Badge variant={variant}>
      <Icon aria-hidden="true" />
      {t(`result_${props.result}`)}
    </Badge>
  );
}

/**
 * A case's analysis report: what the chain shows and what it does not, check by check, with the method and the hash so a
 * lawyer can verify it. It declares no fraud, and holds public facts only. The case page and the preview dialog both show it.
 * @param props - The summary props.
 * @param props.report - The saved report.
 * @returns The summary.
 */
export function ReportSummary(props: { report: ReportView }) {
  const t = useTranslations('Report');
  const format = useFormatter();
  const { snapshot, hash } = props.report;
  const date = (value: string) => format.dateTime(new Date(value), { dateStyle: 'medium' });

  return (
    <div className="grid gap-8">
      <p className="text-base">{snapshot.headline}</p>

      {snapshot.figures.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {snapshot.figures.map((figure) => (
            <StatCard
              key={figure.label}
              label={figure.label}
              value={figure.value}
              hint={figure.note}
            />
          ))}
        </div>
      )}

      <section className="grid gap-4">
        <h3 className="text-lg">{t('checks_title')}</h3>
        <ul className="grid gap-4">
          {snapshot.checks.map((check) => (
            <li key={`${check.claim}-${check.result}`}>
              <Card variant="outline" size="sm">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardDescription>{t('claim_label')}</CardDescription>
                    <ResultBadge result={check.result} />
                  </div>
                  <p className="text-base">{check.claim}</p>
                </CardHeader>
                <CardContent className="grid gap-1">
                  <CardDescription>{t('evidence_label')}</CardDescription>
                  <p>{check.evidence}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h3 className="text-lg">{t('method_title')}</h3>
        <ul className="list-disc pl-5">
          {snapshot.method.tests.map((test) => (
            <li key={test}>{test}</li>
          ))}
        </ul>
        <dl className="grid gap-2 text-sm">
          {snapshot.method.commitment && (
            <div className="grid gap-1 sm:grid-cols-[10rem_1fr]">
              <dt className="text-ink-muted">{t('commitment_label')}</dt>
              <dd className="font-mono break-all">{snapshot.method.commitment}</dd>
            </div>
          )}
          <div className="grid gap-1 sm:grid-cols-[10rem_1fr]">
            <dt className="text-ink-muted">{t('hash_label')}</dt>
            <dd className="font-mono break-all">{hash}</dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-[10rem_1fr]">
            <dt className="text-ink-muted">{t('data_as_of_label')}</dt>
            <dd>{date(snapshot.dataAsOf)}</dd>
          </div>
          {snapshot.sources.length > 0 && (
            <div className="grid gap-1 sm:grid-cols-[10rem_1fr]">
              <dt className="text-ink-muted">{t('sources_label')}</dt>
              <dd>{snapshot.sources.join(', ')}</dd>
            </div>
          )}
          <div className="grid gap-1 sm:grid-cols-[10rem_1fr]">
            <dt className="text-ink-muted">{t('version_label')}</dt>
            <dd>
              {t('version_value', {
                version: props.report.version,
                date: date(props.report.savedAt),
              })}
            </dd>
          </div>
        </dl>
        {props.report.notebookUrl && (
          <a
            href={props.report.notebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="justify-self-start text-sm font-medium underline underline-offset-4 focus-ring hover:text-ink-muted"
          >
            {t('verify_link')}
          </a>
        )}
      </section>

      <p className="text-sm text-ink-muted">{t('disclaimer')}</p>
    </div>
  );
}

import { CheckIcon, MinusIcon, QuestionIcon, XIcon } from '@phosphor-icons/react/ssr';
import { useFormatter, useTranslations } from 'next-intl';
import { ReportTable } from '@/components/cases/ReportTable';
import { StatCard } from '@/components/overview/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Link } from '@/libs/I18nNavigation';
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
 * @param props.caseId - The case the report belongs to, for links into its full analysis.
 * @param props.full - Show every test's output in place, as on the analysis page. Otherwise tests link to it.
 * @returns The summary.
 */
export function ReportSummary(props: { report: ReportView; caseId: string; full?: boolean }) {
  const t = useTranslations('Report');
  const format = useFormatter();
  const { snapshot, hash } = props.report;
  const analysis = `/dashboard/cases/${props.caseId}/analysis`;
  // On the analysis page a test is on the same page; elsewhere it is a link into that page.
  const testHref = (id: string) =>
    props.full ? `#test-${id}` : `${analysis}?version=${props.report.version}#test-${id}`;
  const titleOf = (id: string) => snapshot.tests.find((test) => test.id === id)?.title ?? id;
  const date = (value: string) => format.dateTime(new Date(value), { dateStyle: 'medium' });

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <p className="text-base">{snapshot.headline}</p>
        {!props.full && (
          <Button asChild variant="outline" size="sm" className="justify-self-start">
            <Link href={`${analysis}?version=${props.report.version}`}>{t('full_link')}</Link>
          </Button>
        )}
      </div>

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
                <CardContent className="grid gap-3">
                  <div className="grid gap-1">
                    <CardDescription>{t('evidence_label')}</CardDescription>
                    <p>{check.evidence}</p>
                  </div>
                  {check.tests && check.tests.length > 0 && (
                    <div className="grid gap-1">
                      <CardDescription>{t('tests_label')}</CardDescription>
                      <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {check.tests.map((id) => (
                          <li key={id}>
                            {props.full ? (
                              <a
                                href={testHref(id)}
                                className="text-sm font-medium underline underline-offset-4 focus-ring hover:text-ink-muted"
                              >
                                {titleOf(id)}
                              </a>
                            ) : (
                              <Link
                                href={testHref(id)}
                                className="text-sm font-medium underline underline-offset-4 focus-ring hover:text-ink-muted"
                              >
                                {titleOf(id)}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {check.proof && check.proof.length > 0 && (
                    <div className="grid gap-1">
                      <CardDescription>{t('proof_label')}</CardDescription>
                      <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {check.proof.map((link) => (
                          <li key={link.url}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium underline underline-offset-4 focus-ring hover:text-ink-muted"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h3 className="text-lg">{t('method_title')}</h3>
        <ul className="list-disc pl-5">
          {snapshot.tests.map((test) => (
            <li key={test.id}>
              {props.full ? (
                <a
                  href={testHref(test.id)}
                  className="underline underline-offset-4 focus-ring hover:text-ink-muted"
                >
                  {test.title}
                </a>
              ) : (
                <Link
                  href={testHref(test.id)}
                  className="underline underline-offset-4 focus-ring hover:text-ink-muted"
                >
                  {test.title}
                </Link>
              )}
            </li>
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
      </section>

      {props.full && (
        <section className="grid gap-6">
          <h3 className="text-lg">{t('tests_title')}</h3>
          {snapshot.tests.map((test) => (
            <div key={test.id} id={`test-${test.id}`} className="grid scroll-mt-24 gap-3">
              <h4 className="text-base font-medium">{test.title}</h4>
              <p>{test.summary}</p>
              {test.columns && test.rows && test.rows.length > 0 && (
                <ReportTable columns={test.columns} rows={test.rows} label={test.title} />
              )}
            </div>
          ))}
        </section>
      )}

      <p className="text-sm text-ink-muted">{t('disclaimer')}</p>
    </div>
  );
}

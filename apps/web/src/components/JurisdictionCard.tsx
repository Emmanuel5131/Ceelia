'use client';

import type { Jurisdiction, RuleMode } from '@celia/jurisdictions';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/Cn';

/**
 * The answer for one jurisdiction: which of the four kinds of rule applies, the law, and what Celia does about it.
 * @param props - The card props.
 * @param props.jurisdiction - The jurisdiction to describe.
 * @returns The result card.
 */
export function JurisdictionCard(props: { jurisdiction: Jurisdiction }) {
  const t = useTranslations('Jurisdictions');
  const j = props.jurisdiction;

  const kinds: Record<RuleMode, { title: string; text: string; answer: string }> = {
    certificate: {
      title: t('kind_certificate_title'),
      text: t('kind_certificate_text'),
      answer: t('kind_certificate_answer'),
    },
    authentication: {
      title: t('kind_authentication_title'),
      text: t('kind_authentication_text'),
      answer: t('kind_authentication_answer'),
    },
    presumption: {
      title: t('kind_presumption_title'),
      text: t('kind_presumption_text'),
      answer: t('kind_presumption_answer'),
    },
    equal: {
      title: t('kind_equal_title'),
      text: t('kind_equal_text'),
      answer: t('kind_equal_answer'),
    },
  };
  const kind = j.mode ? kinds[j.mode] : null;
  let status: string | null = null;

  if (j.status === 'built') {
    status = t('status_built');
  } else if (j.status === 'mapped') {
    status = t('status_mapped');
  } else if (j.status === 'inherited' && j.parent) {
    status = t('status_inherited', { country: j.parent.name });
  }

  return (
    <article className="grid gap-6 bg-card p-6 md:p-8">
      <header className="grid gap-1">
        <h2 className="text-2xl">{j.name}</h2>
        {j.parent && <p className="text-sm text-ink-muted">{j.parent.name}</p>}
      </header>

      {kind ? (
        <>
          <div className="grid gap-1 border-[1.5px] border-ink bg-surface p-5">
            <p className="flex items-center gap-3 font-heading text-xl">
              <span className="size-3.5 shrink-0 bg-ink" aria-hidden="true" />
              {kind.title}
            </p>
            <p className="text-ink-muted">{kind.text}</p>
          </div>

          <dl className="grid">
            {j.law && (
              <div className="grid gap-1 border-t border-line-soft py-3 md:grid-cols-[11rem_1fr] md:gap-6">
                <dt className="text-xs tracking-wider text-ink-muted uppercase">
                  {t('law_label')}
                </dt>
                <dd>{j.law}</dd>
              </div>
            )}
            <div className="grid gap-1 border-t border-line-soft py-3 md:grid-cols-[11rem_1fr] md:gap-6">
              <dt className="text-xs tracking-wider text-ink-muted uppercase">
                {t('celia_label')}
              </dt>
              <dd>{kind.answer}</dd>
            </div>
          </dl>
          {status && (
            <p className="flex items-center gap-2 text-sm text-ink-muted">
              <span
                className={cn(
                  'size-2.5 shrink-0',
                  j.status === 'built' ? 'bg-ink' : 'border-[1.5px] border-dashed border-ink',
                )}
                aria-hidden="true"
              />
              {status}
            </p>
          )}
        </>
      ) : (
        <p className="max-w-xl">{t('none_message', { name: j.name })}</p>
      )}
    </article>
  );
}

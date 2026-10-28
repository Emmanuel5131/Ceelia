import { getJurisdiction } from '@celia/jurisdictions';
import { getTranslations } from 'next-intl/server';
import { PageSection } from '@/components/layout/PageSection';
import { jurisdictionName } from '@/utils/cases/JurisdictionName';

/**
 * Who the claimants allege ran the platform, as staff recorded it: notes with names and links, and the jurisdictions the
 * operators are linked to. They are allegations and findings of nothing, and the section says so.
 * @param props - The section props.
 * @param props.operators - The notes, or null when staff have not added any.
 * @param props.jurisdictions - The jurisdiction ids the operators are linked to.
 * @returns The section, or nothing when there is neither.
 */
export async function CaseOperators(props: { operators: string | null; jurisdictions: string[] }) {
  const t = await getTranslations('CaseDetail');

  if (!props.operators && props.jurisdictions.length === 0) {
    return null;
  }

  return (
    <PageSection title={t('operators_title')} description={t('operators_description')}>
      {props.jurisdictions.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={t('operators_places')}>
          {props.jurisdictions.map((id) => {
            const jurisdiction = getJurisdiction(id);

            return (
              <li key={id} className="border border-border bg-surface px-3 py-1 text-sm">
                {jurisdiction ? jurisdictionName(jurisdiction) : id.toUpperCase()}
              </li>
            );
          })}
        </ul>
      )}
      {props.operators && <p className="max-w-3xl whitespace-pre-wrap">{props.operators}</p>}
    </PageSection>
  );
}

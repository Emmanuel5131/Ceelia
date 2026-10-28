import { getJurisdiction } from '@celia/jurisdictions';
import { getFormatter, getTranslations } from 'next-intl/server';
import { PageSection } from '@/components/layout/PageSection';
import { listAffectedCountries } from '@/libs/cases/Cases';

/**
 * Where the confirmed victims in a case are: each country with how many confirmed claims, as counts only. A case is not in one place,
 * so this takes the place of a single jurisdiction. Countries with a single confirmed claim are counted together, so one claim cannot
 * point at one person.
 * @param props - The section props.
 * @param props.caseId - The case id.
 * @returns The section, or nothing when no claim names a country.
 */
export async function AffectedJurisdictions(props: { caseId: string }) {
  const t = await getTranslations('CaseDetail');
  const format = await getFormatter();
  const { countries, others } = await listAffectedCountries(props.caseId);

  if (countries.length === 0 && others === 0) {
    return null;
  }

  return (
    <PageSection title={t('affected_title')} description={t('affected_description')}>
      <ul className="flex flex-wrap gap-2">
        {countries.map((row) => (
          <li key={row.country} className="border border-border bg-surface px-3 py-1 text-sm">
            {getJurisdiction(row.country)?.name ?? row.country.toUpperCase()}
            <span className="ml-2 text-ink-muted tabular-nums">{format.number(row.total)}</span>
          </li>
        ))}
        {others > 0 && (
          <li className="border border-dashed border-border px-3 py-1 text-sm text-ink-muted">
            {t('affected_others', { count: others })}
          </li>
        )}
      </ul>
    </PageSection>
  );
}

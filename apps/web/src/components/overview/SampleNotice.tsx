import { InfoIcon } from '@phosphor-icons/react/dist/ssr';
import { getTranslations } from 'next-intl/server';

/**
 * A quiet strip that says the numbers on the page are sample data, so nobody mistakes them for real cases.
 * @returns The notice.
 */
export async function SampleNotice() {
  const t = await getTranslations('Overview');

  return (
    <p className="mb-8 flex items-center gap-3 border border-dashed border-border bg-paper px-4 py-3 text-sm text-ink-muted">
      <InfoIcon className="size-4 shrink-0" aria-hidden="true" />
      {t('sample_notice')}
    </p>
  );
}

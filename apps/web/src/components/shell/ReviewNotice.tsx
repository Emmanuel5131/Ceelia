import { InfoIcon } from '@phosphor-icons/react/ssr';
import { getTranslations } from 'next-intl/server';

/**
 * Shown to counsel whose registration staff have not checked yet. It says what is locked and what is not, and gives no
 * timeline, because we do not promise one.
 * @returns The notice.
 */
export async function ReviewNotice() {
  const t = await getTranslations('AppShell');

  return (
    <output className="mb-8 flex items-start gap-3 border border-border bg-paper px-4 py-3 text-sm text-ink-muted">
      <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {t('review_pending')}
    </output>
  );
}

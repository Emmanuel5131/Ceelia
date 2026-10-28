import { CheckIcon, XIcon } from '@phosphor-icons/react/ssr';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { reviewDays } from '@/utils/accounts/Institution';

function Points(props: { items: string[]; mark: 'yes' | 'no' }) {
  const Icon = props.mark === 'yes' ? CheckIcon : XIcon;

  return (
    <ul className="grid gap-2 text-sm">
      {props.items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * The plan an institution pays for, shown before anyone applies: the flat fee, what it covers, what it does not, and how the
 * review works. The fee comes from the settings, so it can be set without a code change.
 * @param props - The plan props.
 * @param props.price - The fee as it should read, such as `€1,200 a year`; when missing, the page says it is published before payment.
 * @returns The plan.
 */
export async function InstitutionPlan(props: { price?: string }) {
  const t = await getTranslations('InstitutionPlan');

  return (
    <div className="grid gap-6">
      <Card variant="outline">
        <CardHeader>
          <CardTitle className="font-sans text-base font-medium">{t('fee_title')}</CardTitle>
          <CardDescription>{props.price ?? t('fee_unset')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-ink-muted">
          <p>{t('fee_pay_note')}</p>
          <p>{t('fee_free_note')}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid content-start gap-3">
          <h2 className="text-base font-medium">{t('covers_title')}</h2>
          <Points mark="yes" items={[t('covers_1'), t('covers_2'), t('covers_3'), t('covers_4')]} />
        </div>
        <div className="grid content-start gap-3">
          <h2 className="text-base font-medium">{t('not_title')}</h2>
          <Points mark="no" items={[t('not_1'), t('not_2'), t('not_3')]} />
        </div>
      </div>

      <div className="grid gap-3">
        <h2 className="text-base font-medium">{t('review_title')}</h2>
        <ol className="grid list-decimal gap-2 pl-5 text-sm">
          <li>{t('review_1')}</li>
          <li>{t('review_2')}</li>
          <li>{t('review_3')}</li>
          <li>{t('review_4')}</li>
        </ol>
        <p className="text-sm text-ink-muted">{t('review_time', { days: reviewDays })}</p>
      </div>
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { confirmUnsubscribe } from '@/app/[locale]/unsubscribe/actions';
import { Button } from '@/components/ui/button';

/**
 * The confirmation on the unsubscribe page. Turning emails off needs a press, never just opening the link.
 * @param props - The form props.
 * @param props.token - The signed token from the link.
 * @returns The button and, after it, the result.
 */
export function UnsubscribeForm(props: { token: string }) {
  const t = useTranslations('Unsubscribe');
  const [result, setResult] = React.useState<'done' | 'failed'>();
  const [pending, startTransition] = React.useTransition();

  if (result === 'done') {
    return <output>{t('done')}</output>;
  }

  return (
    <div className="grid gap-4">
      <Button
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            setResult((await confirmUnsubscribe(props.token)) ? 'done' : 'failed');
          });
        }}
      >
        {t('confirm')}
      </Button>
      {result === 'failed' && (
        <p role="alert" className="text-sm text-seal">
          {t('failed')}
        </p>
      )}
    </div>
  );
}

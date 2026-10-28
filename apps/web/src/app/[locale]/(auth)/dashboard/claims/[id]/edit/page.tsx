import { currentUser } from '@clerk/nextjs/server';
import { ArrowLeftIcon } from '@phosphor-icons/react/ssr';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import * as z from 'zod';
import { toClaimDefaults } from '@/components/claims/claim-defaults';
import { NewClaimForm } from '@/components/claims/NewClaimForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { listClaimExtras } from '@/libs/claims/ClaimExtras';
import { getClaim } from '@/libs/claims/Claims';
import { Link } from '@/libs/I18nNavigation';
import { parseAccount } from '@/utils/accounts/Account';
import { getI18nPath } from '@/utils/Helpers';

type EditClaimPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata(props: EditClaimPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ClaimPage' });

  return {
    title: t('meta_title_edit'),
    description: t('meta_description_edit'),
  };
}

export default async function EditClaimPage(props: EditClaimPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ClaimPage' });
  const user = await currentUser();

  // Only people file claims; counsel take cases.
  if (!user || parseAccount(user.publicMetadata)?.accountType !== 'person') {
    redirect(getI18nPath('/dashboard', locale));
  }

  // A claim that is not yours looks the same as one that does not exist.
  const claim = z.uuid().safeParse(id).success ? await getClaim(user.id, id) : undefined;

  if (!claim) {
    notFound();
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3 justify-self-start">
        <Link href={`/dashboard/claims/${claim.id}`}>
          <ArrowLeftIcon aria-hidden="true" />
          {t('back_to_claim')}
        </Link>
      </Button>
      <PageHeader centered compact title={t('edit_title')} />
      {claim.status === 'submitted' && (
        <output className="mb-6 block border border-border bg-paper px-4 py-3 text-sm text-ink-muted">
          {t('edit_sent_notice')}
        </output>
      )}
      <NewClaimForm
        edit={{ id: claim.id, defaults: toClaimDefaults(claim, await listClaimExtras(claim.id)) }}
      />
    </>
  );
}

import { currentUser } from '@clerk/nextjs/server';
import { ArrowLeftIcon } from '@phosphor-icons/react/ssr';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as z from 'zod';
import { ClaimFile } from '@/components/cases/ClaimFile';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { canViewCaseClaims, getCaseClaim } from '@/libs/CaseClaims';
import { getCase } from '@/libs/Cases';
import { claimantNames } from '@/libs/ClaimantNames';
import { Link } from '@/libs/I18nNavigation';
import { parseAccount } from '@/utils/Account';

type ClaimFilePageProps = {
  params: Promise<{ locale: string; id: string; claimId: string }>;
};

export async function generateMetadata(props: ClaimFilePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CaseClaim' });

  return { title: t('meta_title'), description: t('meta_description') };
}

export default async function ClaimFilePage(props: ClaimFilePageProps) {
  const { locale, id, claimId } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'CaseClaim' });
  const user = await currentUser();
  const ids = z.object({ id: z.uuid(), claimId: z.uuid() }).safeParse({ id, claimId });

  // Anyone who may not read these claims is told the page does not exist, the same as for a claim that is not in the case.
  if (!user || !ids.success) {
    notFound();
  }

  const staff = parseAccount(user.publicMetadata)?.staff === true;

  if (!(await canViewCaseClaims({ userId: user.id, staff }, id))) {
    notFound();
  }

  const [found, claim] = await Promise.all([getCase(id), getCaseClaim(id, claimId)]);

  if (!found || !claim) {
    notFound();
  }

  const names = await claimantNames([claim.userId]);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3 justify-self-start">
        <Link href={`/dashboard/cases/${id}`}>
          <ArrowLeftIcon aria-hidden="true" />
          {t('back', { name: found.name })}
        </Link>
      </Button>
      <PageHeader
        title={names.get(claim.userId) ?? t('claimant_label')}
        description={<span className="font-mono text-base">{found.number}</span>}
      />
      <ClaimFile claim={claim} name={names.get(claim.userId) ?? t('claimant_label')} />
    </>
  );
}

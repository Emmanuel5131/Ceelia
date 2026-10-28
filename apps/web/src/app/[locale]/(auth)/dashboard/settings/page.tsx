import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmailPreferences } from '@/components/settings/EmailPreferences';
import { ManageAccountButton } from '@/components/settings/ManageAccountButton';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { SettingsContent } from '@/components/settings/SettingsContent';
import { getEmailPreferences } from '@/libs/notifications/Preferences';
import { parseAccount } from '@/utils/accounts/Account';
import { parseProfile } from '@/utils/accounts/Profile';

type SettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: SettingsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Settings' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SettingsPage(props: SettingsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();
  const account = parseAccount(user?.publicMetadata);
  const profile = account ? parseProfile(account.accountType, user?.privateMetadata) : null;

  const preferences = user ? await getEmailPreferences(user.id) : {};

  return (
    <SettingsContent
      emails={
        account ? (
          <EmailPreferences
            categories={account.accountType === 'person' ? ['claims', 'cases'] : ['cases']}
            preferences={preferences}
          />
        ) : null
      }
      profile={account && profile ? <ProfileSection account={account} profile={profile} /> : null}
      manageAccount={<ManageAccountButton />}
    />
  );
}

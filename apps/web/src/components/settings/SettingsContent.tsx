import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { SettingsList, SettingsRow } from '@/components/layout/SettingsList';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ThemeSelect } from '@/components/settings/ThemeSelect';

/**
 * The settings page: what the person told us in onboarding, then the account (managed in Clerk's modal) and the two
 * preferences that work without a server, the theme and the language. New settings are one more `SettingsRow`.
 * @param props - The content props.
 * @param props.profile - The onboarding details with their edit controls, or nothing for an account made before they were kept.
 * @param props.emails - The email switches, or nothing when there are none to show.
 * @param props.manageAccount - The button that opens the account modal, so this page does not depend on Clerk.
 * @returns The page content.
 */
export async function SettingsContent(props: {
  profile?: React.ReactNode;
  emails?: React.ReactNode;
  manageAccount: React.ReactNode;
}) {
  const t = await getTranslations('Settings');

  return (
    <>
      <PageHeader title={t('page_title')} description={t('page_description')} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12">
        {props.profile && (
          <PageSection title={t('profile_title')} description={t('profile_description')}>
            {props.profile}
          </PageSection>
        )}
        {props.emails && (
          <PageSection title={t('emails_title')} description={t('emails_description')}>
            {props.emails}
          </PageSection>
        )}
        <PageSection title={t('preferences_title')}>
          <SettingsList>
            <SettingsRow title={t('account_title')} description={t('account_description')}>
              {props.manageAccount}
            </SettingsRow>
            <SettingsRow title={t('theme_title')} description={t('theme_description')}>
              <ThemeSelect />
            </SettingsRow>
            <SettingsRow title={t('language_title')} description={t('language_description')}>
              <LocaleSwitcher />
            </SettingsRow>
          </SettingsList>
        </PageSection>
      </div>
    </>
  );
}

import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { SettingsList, SettingsRow } from '@/components/layout/SettingsList';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ThemeSelect } from '@/components/settings/ThemeSelect';

/**
 * The settings page: the account (managed in Clerk's modal), then the two preferences that work without a server, the theme
 * and the language. New settings are one more `SettingsRow`.
 * @param props - The content props.
 * @param props.manageAccount - The button that opens the account modal, so this page does not depend on Clerk.
 * @returns The page content.
 */
export async function SettingsContent(props: { manageAccount: React.ReactNode }) {
  const t = await getTranslations('Settings');

  return (
    <>
      <PageHeader title={t('page_title')} description={t('page_description')} />
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
    </>
  );
}

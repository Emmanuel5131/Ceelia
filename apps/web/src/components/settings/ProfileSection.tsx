import { getJurisdiction } from '@celia/jurisdictions';
import { getTranslations } from 'next-intl/server';
import { SettingsList, SettingsRow } from '@/components/layout/SettingsList';
import { EditProfileDialog } from '@/components/settings/EditProfileDialog';
import { Badge } from '@/components/ui/badge';
import type { Account } from '@/utils/Account';
import { jurisdictionName } from '@/utils/JurisdictionName';
import type { Profile } from '@/utils/Profile';

const nameOf = (id: string) => {
  const jurisdiction = getJurisdiction(id);

  return jurisdiction ? jurisdictionName(jurisdiction) : id;
};

/**
 * What the person told us in onboarding, with a way to change it. The account type is shown but cannot be changed: it decides
 * what a person may see, so it is chosen once. A lawyer also sees where their registration review stands.
 * @param props - The section props.
 * @param props.account - The account, for its type and review status.
 * @param props.profile - What the person gave in onboarding.
 * @returns The list of details.
 */
export async function ProfileSection(props: { account: Account; profile: Profile }) {
  const t = await getTranslations('Settings');
  const { profile } = props;

  return (
    <SettingsList>
      <SettingsRow title={t('type_title')} description={t('type_description')}>
        <Badge variant="muted">
          {profile.accountType === 'person' ? t('type_person') : t('type_counsel')}
        </Badge>
      </SettingsRow>
      {profile.accountType === 'person' ? (
        <SettingsRow title={t('country_title')} description={t('country_description')}>
          <div className="flex items-center gap-4">
            <span className="font-medium">{nameOf(profile.country)}</span>
            <EditProfileDialog profile={profile} />
          </div>
        </SettingsRow>
      ) : (
        <>
          <SettingsRow title={t('practice_title')} description={t('practice_description')}>
            <div className="flex items-start gap-6">
              <div className="grid gap-2 sm:text-right">
                <span className="font-medium">{profile.firm ?? t('practice_independent')}</span>
                <p className="text-xs text-ink-muted">{t('admitted_title')}</p>
                <ul className="grid gap-1 text-sm">
                  {profile.jurisdictions.map((id) => (
                    <li key={id}>{nameOf(id)}</li>
                  ))}
                </ul>
              </div>
              <EditProfileDialog profile={profile} />
            </div>
          </SettingsRow>
          <SettingsRow title={t('review_title')} description={t('review_description')}>
            {props.account.review === 'verified' ? (
              <Badge variant="solid">{t('review_verified')}</Badge>
            ) : (
              <Badge variant="dashed">{t('review_in_review')}</Badge>
            )}
          </SettingsRow>
        </>
      )}
    </SettingsList>
  );
}

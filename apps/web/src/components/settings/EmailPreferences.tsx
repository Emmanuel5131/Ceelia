'use client';

import type { EmailPreferences as Preferences, OptionalCategory } from '@celia/core';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { SettingsList, SettingsRow } from '@/components/layout/SettingsList';
import { Switch } from '@/components/ui/switch';
import { updateEmailPreference } from '@/libs/notifications/InboxActions';

function CategorySwitch(props: { category: OptionalCategory; initial: boolean }) {
  const t = useTranslations('Settings');
  const [checked, setChecked] = React.useState(props.initial);
  const [pending, startTransition] = React.useTransition();

  return (
    <SettingsRow
      title={t(`email_${props.category}_title`)}
      description={t(`email_${props.category}_description`)}
    >
      <Switch
        checked={checked}
        disabled={pending}
        aria-label={t(`email_${props.category}_title`)}
        onCheckedChange={(next) => {
          setChecked(next);
          startTransition(async () => {
            await updateEmailPreference(props.category, next);
          });
        }}
      />
    </SettingsRow>
  );
}

/**
 * One switch for each category of email a person can turn off. Account and registration notices are not here because they are
 * always sent; the section says so.
 * @param props - The preferences props.
 * @param props.categories - The categories that apply to this person.
 * @param props.preferences - What they chose so far; a category they never touched is on.
 * @returns The switches.
 */
export function EmailPreferences(props: {
  categories: OptionalCategory[];
  preferences: Preferences;
}) {
  return (
    <SettingsList>
      {props.categories.map((category) => (
        <CategorySwitch
          key={category}
          category={category}
          initial={props.preferences[category] !== false}
        />
      ))}
    </SettingsList>
  );
}

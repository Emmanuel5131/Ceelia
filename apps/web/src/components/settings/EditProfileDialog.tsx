'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { updateProfile } from '@/app/[locale]/(auth)/dashboard/settings/actions';
import { FieldError } from '@/components/onboarding/FieldError';
import { JurisdictionPicker } from '@/components/onboarding/JurisdictionPicker';
import { PracticeFields } from '@/components/onboarding/PracticeFields';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Profile } from '@/utils/Profile';

/**
 * The "Edit" button and the dialog behind it, for the details given in onboarding: a person's country, or a lawyer's practice
 * and jurisdictions. The server action decides what may change; the account type never does.
 * @param props - The dialog props.
 * @param props.profile - What the person gave before.
 * @returns The button and its dialog.
 */
export function EditProfileDialog(props: { profile: Profile }) {
  const t = useTranslations('Settings');
  const onboarding = useTranslations('OnboardingPage');
  const [open, setOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [pending, startTransition] = React.useTransition();
  const { profile } = props;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setErrors([]);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t('profile_edit')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <form
          className="grid gap-6"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);

            startTransition(async () => {
              const result = await updateProfile(data);
              setErrors(result.errors);

              if (result.errors.length === 0) {
                setOpen(false);
              }
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('profile_edit_title')}</DialogTitle>
            <DialogDescription>
              {profile.accountType === 'person'
                ? onboarding('person_text')
                : t('profile_review_warning')}
            </DialogDescription>
          </DialogHeader>
          {profile.accountType === 'person' ? (
            <div className="grid gap-2">
              <JurisdictionPicker
                name="country"
                kind="country"
                label={onboarding('country_label')}
                placeholder={onboarding('country_placeholder')}
                defaultId={profile.country}
                invalid={errors.includes('country')}
              />
              <FieldError show={errors.includes('country')} />
            </div>
          ) : (
            <PracticeFields
              errors={errors}
              defaults={{ firm: profile.firm, jurisdictions: profile.jurisdictions }}
            />
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {t('profile_save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

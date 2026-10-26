import * as z from 'zod';

const required = z.string().trim().min(1).max(200);

/** One bar or registration entry: where the lawyer is admitted and under which number. */
const RegistrationValidation = z.object({
  jurisdiction: required,
  number: required,
});

const PersonValidation = z.object({
  accountType: z.literal('person'),
  country: required,
  consent: z.literal('on'),
});

const CounselValidation = z
  .object({
    accountType: z.literal('counsel'),
    independent: z.literal('on').optional(),
    firmName: z.string().trim().max(200).optional(),
    registrations: z.array(RegistrationValidation).min(1).max(10),
    acceptTerms: z.literal('on'),
    confirmConflicts: z.literal('on'),
  })
  .refine((value) => value.independent === 'on' || (value.firmName ?? '') !== '', {
    path: ['firmName'],
  });

/** The onboarding form, as the server action receives it. */
export const OnboardingValidation = z.discriminatedUnion('accountType', [
  PersonValidation,
  CounselValidation,
]);

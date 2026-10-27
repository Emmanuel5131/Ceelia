import * as z from 'zod';

const required = z.string().trim().min(1).max(200);

/** One bar or registration entry: where the lawyer is admitted. */
const RegistrationValidation = z.object({
  jurisdiction: required,
});

/** The details a person gives and may change later: where they live. */
export const PersonProfileValidation = z.object({
  country: required,
});

const counselProfileShape = {
  independent: z.literal('on').optional(),
  firmName: z.string().trim().max(200).optional(),
  registrations: z.array(RegistrationValidation).min(1).max(10),
};

// A lawyer needs a firm name unless they practise independently.
const hasFirmOrIsIndependent = (value: { independent?: 'on'; firmName?: string }) =>
  value.independent === 'on' || (value.firmName ?? '') !== '';

/** The details a lawyer gives and may change later: the practice and where they are admitted. */
export const CounselProfileValidation = z
  .object(counselProfileShape)
  .refine(hasFirmOrIsIndependent, { path: ['firmName'] });

const PersonValidation = PersonProfileValidation.extend({
  accountType: z.literal('person'),
  consent: z.literal('on'),
});

const CounselValidation = z
  .object({
    accountType: z.literal('counsel'),
    ...counselProfileShape,
    acceptTerms: z.literal('on'),
    confirmConflicts: z.literal('on'),
  })
  .refine(hasFirmOrIsIndependent, { path: ['firmName'] });

/** The onboarding form, as the server action receives it. */
export const OnboardingValidation = z.discriminatedUnion('accountType', [
  PersonValidation,
  CounselValidation,
]);

import { describe, expect, it } from 'vitest';
import { OnboardingValidation } from './OnboardingValidation';

const counsel = {
  accountType: 'counsel',
  kind: 'law_firm',
  registrationNumber: 'NBA-12345',
  firmName: 'Adeyemi & Co',
  registrations: [{ jurisdiction: 'ng' }],
  acceptTerms: 'on',
  confirmConflicts: 'on',
};

describe('Onboarding input', () => {
  it('accepts a person with a country and consent', () => {
    expect(
      OnboardingValidation.safeParse({ accountType: 'person', country: 'ng', consent: 'on' })
        .success,
    ).toBeTruthy();
  });

  it('rejects a person who has not given consent', () => {
    expect(
      OnboardingValidation.safeParse({ accountType: 'person', country: 'ng' }).success,
    ).toBeFalsy();
  });

  it('accepts counsel with a firm name', () => {
    expect(OnboardingValidation.safeParse(counsel).success).toBeTruthy();
  });

  it('accepts counsel who practise independently without a firm name', () => {
    expect(
      OnboardingValidation.safeParse({ ...counsel, firmName: '', independent: 'on' }).success,
    ).toBeTruthy();
  });

  it('rejects counsel with no firm name and not independent', () => {
    expect(OnboardingValidation.safeParse({ ...counsel, firmName: '' }).success).toBeFalsy();
  });

  it('rejects an application with no registration number', () => {
    expect(
      OnboardingValidation.safeParse({ ...counsel, registrationNumber: '' }).success,
    ).toBeFalsy();
  });

  it('rejects an application with an unknown kind of organisation', () => {
    expect(OnboardingValidation.safeParse({ ...counsel, kind: 'bank' }).success).toBeFalsy();
  });

  it('accepts an investigative firm with a website', () => {
    expect(
      OnboardingValidation.safeParse({
        ...counsel,
        kind: 'investigative',
        website: 'https://firm.example',
      }).success,
    ).toBeTruthy();
  });

  it('rejects a website that is not an address', () => {
    expect(
      OnboardingValidation.safeParse({ ...counsel, website: 'not a site' }).success,
    ).toBeFalsy();
  });

  it('rejects counsel with no registration', () => {
    expect(OnboardingValidation.safeParse({ ...counsel, registrations: [] }).success).toBeFalsy();
  });

  it('rejects counsel who have not accepted the terms', () => {
    expect(
      OnboardingValidation.safeParse({ ...counsel, acceptTerms: undefined }).success,
    ).toBeFalsy();
  });

  it('rejects an account type that cannot be chosen', () => {
    expect(OnboardingValidation.safeParse({ accountType: 'admin' }).success).toBeFalsy();
  });
});

import { describe, expect, it } from 'vitest';
import { OnboardingValidation } from './OnboardingValidation';

const counsel = {
  accountType: 'counsel',
  firmName: 'Adeyemi & Co',
  registrations: [{ jurisdiction: 'ng', number: 'SCN12345' }],
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

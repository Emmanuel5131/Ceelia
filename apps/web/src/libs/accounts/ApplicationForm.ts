const text = (formData: FormData, name: string) => formData.get(name) ?? undefined;

/**
 * Turns an empty optional field into null, so a blank website is not kept as an empty string.
 * @param value - The field.
 * @returns The value, or null when it is missing or empty.
 */
export const blankToNull = (value: string | undefined) =>
  value === undefined || value === '' ? null : value;

/**
 * Reads the application fields of a form into the shape the validation expects. Registrations arrive as a list of
 * jurisdictions, one per row. Onboarding and applying again both use it.
 * @param formData - The submitted form.
 * @returns The raw fields, not yet validated.
 */
export function readApplicationFields(formData: FormData) {
  return {
    independent: text(formData, 'independent'),
    firmName: text(formData, 'firmName'),
    acceptTerms: text(formData, 'acceptTerms'),
    confirmConflicts: text(formData, 'confirmConflicts'),
    kind: text(formData, 'kind'),
    registrationNumber: text(formData, 'registrationNumber'),
    website: text(formData, 'website'),
    contactRole: text(formData, 'contactRole'),
    registrations: formData.getAll('registrationJurisdiction').map((jurisdiction) => ({
      jurisdiction,
    })),
  };
}

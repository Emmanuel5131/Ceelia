import { describe, expect, it } from 'vitest';
import { isAdmittedFor } from './Admission';

describe(isAdmittedFor, () => {
  it('matches the same jurisdiction', () => {
    expect(isAdmittedFor(['ng'], 'ng')).toBeTruthy();
  });

  it('matches a lawyer admitted in a state for a case in its country', () => {
    expect(isAdmittedFor(['us-ny'], 'us')).toBeTruthy();
  });

  it('matches a lawyer admitted in a country for a case in one of its states', () => {
    expect(isAdmittedFor(['us'], 'us-ny')).toBeTruthy();
  });

  it('does not match another country', () => {
    expect(isAdmittedFor(['ng', 'gb'], 'us')).toBeFalsy();
  });

  it('does not match a lawyer admitted in a different state', () => {
    expect(isAdmittedFor(['us-ca'], 'us-ny')).toBeFalsy();
  });

  it('does not match a lawyer with no jurisdictions', () => {
    expect(isAdmittedFor([], 'ng')).toBeFalsy();
  });
});

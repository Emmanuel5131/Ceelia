import { describe, expect, it } from 'vitest';
import { claimSteps } from './ClaimSteps';

describe(claimSteps, () => {
  it('starts at ownership for a new claim', () => {
    expect(
      claimSteps({
        ownership: 'unsigned',
        paymentMethod: 'wallet',
        statement: null,
        status: 'draft',
      }),
    ).toStrictEqual(['done', 'current', 'todo', 'todo', 'todo', 'todo']);
  });

  it('moves on once ownership is signed', () => {
    expect(
      claimSteps({
        ownership: 'signed',
        paymentMethod: 'wallet',
        statement: null,
        status: 'draft',
      }).slice(0, 3),
    ).toStrictEqual(['done', 'done', 'current']);
  });

  it('points at the first gap when steps are done out of order', () => {
    expect(
      claimSteps({
        ownership: 'unsigned',
        paymentMethod: 'wallet',
        statement: 'I lost money.',
        status: 'draft',
      }).slice(0, 4),
    ).toStrictEqual(['done', 'current', 'done', 'todo']);
  });

  it('counts the transaction reference as the second step when there is no wallet to sign with', () => {
    expect(
      claimSteps({
        ownership: 'unsigned',
        paymentMethod: 'atm',
        statement: null,
        status: 'draft',
      }).slice(0, 3),
    ).toStrictEqual(['done', 'done', 'current']);
  });

  it('leaves pooling and counsel to come after a sent claim', () => {
    expect(
      claimSteps({
        ownership: 'signed',
        paymentMethod: 'wallet',
        statement: 'x',
        status: 'submitted',
      }),
    ).toStrictEqual(['done', 'done', 'done', 'done', 'current', 'todo']);
  });
});

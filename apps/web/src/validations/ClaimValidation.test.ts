import { describe, expect, it } from 'vitest';
import { CreateClaimValidation, StatementValidation } from './ClaimValidation';

const claim = {
  chain: 'evm',
  walletAddress: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  platformName: 'Quantum Fi',
};

describe('Claim input', () => {
  it('accepts a valid wallet and platform', () => {
    expect(CreateClaimValidation.safeParse(claim).success).toBeTruthy();
  });

  it('rejects an address that does not fit the chain', () => {
    expect(CreateClaimValidation.safeParse({ ...claim, chain: 'solana' }).success).toBeFalsy();
  });

  it('rejects an unknown chain', () => {
    expect(CreateClaimValidation.safeParse({ ...claim, chain: 'dogecoin' }).success).toBeFalsy();
  });

  it('accepts an empty website but rejects a bad one', () => {
    expect(CreateClaimValidation.safeParse({ ...claim, platformUrl: '' }).success).toBeTruthy();
    expect(
      CreateClaimValidation.safeParse({ ...claim, platformUrl: 'quantum.fi' }).success,
    ).toBeFalsy();
  });

  it('rejects a statement that is too short', () => {
    expect(StatementValidation.safeParse({ statement: 'They took it.' }).success).toBeFalsy();
  });

  it('accepts a statement with a few sentences', () => {
    expect(
      StatementValidation.safeParse({
        statement: 'I was promised 10% a week by a Telegram admin and could not withdraw.',
      }).success,
    ).toBeTruthy();
  });
});

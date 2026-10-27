import { describe, expect, it } from 'vitest';
import { CreateClaimValidation, StatementValidation } from './ClaimValidation';

const hash = `0x${'a'.repeat(64)}`;
const wallet = {
  fraudType: 'investment_platform',
  paymentMethod: 'wallet',
  chain: 'ethereum',
  walletAddress: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  platformName: 'Quantum Fi',
};
const exchange = {
  fraudType: 'impersonation',
  paymentMethod: 'exchange',
  chain: 'tron',
  txHash: 'b'.repeat(64),
  unknownOperator: 'on',
};

describe('Claim input', () => {
  describe('paid from a wallet', () => {
    it('accepts a valid wallet and operator', () => {
      expect(CreateClaimValidation.safeParse(wallet).success).toBeTruthy();
    });

    it('rejects an address that does not fit the chain', () => {
      expect(CreateClaimValidation.safeParse({ ...wallet, chain: 'solana' }).success).toBeFalsy();
    });

    it('rejects a missing wallet', () => {
      expect(CreateClaimValidation.safeParse({ ...wallet, walletAddress: '' }).success).toBeFalsy();
    });

    it('rejects a transaction hash that does not fit the chain', () => {
      expect(CreateClaimValidation.safeParse({ ...wallet, txHash: 'nope' }).success).toBeFalsy();
      expect(CreateClaimValidation.safeParse({ ...wallet, txHash: hash }).success).toBeTruthy();
    });
  });

  describe('paid another way', () => {
    it('accepts a transaction hash and an unknown operator', () => {
      expect(CreateClaimValidation.safeParse(exchange).success).toBeTruthy();
    });

    it('needs a transaction hash instead of a wallet', () => {
      expect(CreateClaimValidation.safeParse({ ...exchange, txHash: '' }).success).toBeFalsy();
    });
  });

  describe('the operator', () => {
    it('needs a name unless the person does not know it', () => {
      expect(CreateClaimValidation.safeParse({ ...wallet, platformName: '' }).success).toBeFalsy();
      expect(
        CreateClaimValidation.safeParse({ ...wallet, platformName: '', unknownOperator: 'on' })
          .success,
      ).toBeTruthy();
    });

    it('accepts an empty website but rejects a bad one', () => {
      expect(CreateClaimValidation.safeParse({ ...wallet, platformUrl: '' }).success).toBeTruthy();
      expect(
        CreateClaimValidation.safeParse({ ...wallet, platformUrl: 'quantum.fi' }).success,
      ).toBeFalsy();
    });
  });

  it('accepts any listed chain, including ones we cannot check yet', () => {
    expect(
      CreateClaimValidation.safeParse({
        ...wallet,
        chain: 'tron',
        walletAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      }).success,
    ).toBeTruthy();
    expect(
      CreateClaimValidation.safeParse({
        ...wallet,
        chain: 'litecoin',
        walletAddress: 'LTC1abcdefghijk',
      }).success,
    ).toBeTruthy();
  });

  it('rejects an unknown chain, fraud type or payment method', () => {
    expect(CreateClaimValidation.safeParse({ ...wallet, chain: 'notachain' }).success).toBeFalsy();
    expect(
      CreateClaimValidation.safeParse({ ...wallet, fraudType: 'market_loss' }).success,
    ).toBeFalsy();
    expect(
      CreateClaimValidation.safeParse({ ...wallet, paymentMethod: 'cash' }).success,
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

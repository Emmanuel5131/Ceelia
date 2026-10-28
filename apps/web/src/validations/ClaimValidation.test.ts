import { describe, expect, it } from 'vitest';
import { CreateClaimValidation, StatementValidation } from './ClaimValidation';

const hash = `0x${'a'.repeat(64)}`;
const wallet = {
  fraudTypes: ['investment_platform'],
  paymentMethod: 'wallet',
  chain: 'ethereum',
  walletAddress: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  platformName: 'Quantum Fi',
};
const exchange = {
  fraudTypes: ['impersonation'],
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

  describe('token', () => {
    it('keeps a token name and drops an empty one', () => {
      const named = CreateClaimValidation.safeParse({ ...wallet, tokenName: 'Moon Inu (MINU)' });
      const empty = CreateClaimValidation.safeParse({ ...wallet, tokenName: '' });

      expect(named.success && named.data.tokenName).toBe('Moon Inu (MINU)');
      expect(empty.success && empty.data.tokenName).toBeUndefined();
    });
  });

  describe('payment details', () => {
    const detail = { ...wallet, destinationAddress: '0x000000000000000000000000000000000000dead' };

    it('accepts a destination address, dates and an asset', () => {
      expect(
        CreateClaimValidation.safeParse({
          ...detail,
          firstPaymentOn: '2026-01-05',
          lastPaymentOn: '2026-02-01',
          assetSent: 'USDT',
        }).success,
      ).toBeTruthy();
    });

    it('rejects a destination address that does not fit the chain', () => {
      expect(
        CreateClaimValidation.safeParse({ ...detail, chain: 'solana', walletAddress: undefined })
          .success,
      ).toBeFalsy();
    });

    it('rejects a date that is not real or is in the future', () => {
      expect(
        CreateClaimValidation.safeParse({ ...wallet, firstPaymentOn: '2026-02-30' }).success,
      ).toBeFalsy();
      expect(
        CreateClaimValidation.safeParse({ ...wallet, lastPaymentOn: '2999-01-01' }).success,
      ).toBeFalsy();
    });

    it('rejects a last payment before the first', () => {
      expect(
        CreateClaimValidation.safeParse({
          ...wallet,
          firstPaymentOn: '2026-02-01',
          lastPaymentOn: '2026-01-01',
        }).success,
      ).toBeFalsy();
    });
  });

  describe('wallet app', () => {
    it('is optional and must be a known wallet', () => {
      expect(
        CreateClaimValidation.safeParse({ ...wallet, walletApp: 'metamask' }).success,
      ).toBeTruthy();
      expect(
        CreateClaimValidation.safeParse({ ...wallet, walletApp: 'notawallet' }).success,
      ).toBeFalsy();
    });
  });

  describe('funding transaction', () => {
    it('is optional and must fit the chain when given', () => {
      expect(CreateClaimValidation.safeParse(wallet).success).toBeTruthy();
      expect(
        CreateClaimValidation.safeParse({ ...wallet, fundingTxHash: hash }).success,
      ).toBeTruthy();
      expect(
        CreateClaimValidation.safeParse({ ...wallet, fundingTxHash: 'nope' }).success,
      ).toBeFalsy();
    });
  });

  describe('more wallets and transactions', () => {
    const solana = '4Nd1mYbNoVDqUPCNRkMsvxfC6kzGZsT9bYZ4wCpYh1Ke';

    it('accepts several wallets and transactions on different chains', () => {
      const claim = {
        ...wallet,
        moreAffected: [
          { chain: 'ethereum', value: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' },
          { chain: 'solana', value: solana },
        ],
        moreReceiving: [{ chain: 'tron', value: 'TJRyWwFs9wTFGZg3JbrVriFbNfCug5tDeC' }],
        moreTransactions: [{ chain: 'ethereum', value: hash }],
      };

      expect(CreateClaimValidation.safeParse(claim).success).toBeTruthy();
    });

    it('checks each address against its own chain', () => {
      const result = CreateClaimValidation.safeParse({
        ...wallet,
        moreAffected: [{ chain: 'solana', value: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' }],
      });

      expect(result.success).toBeFalsy();
    });

    it('rejects a transaction hash that does not fit its chain', () => {
      const result = CreateClaimValidation.safeParse({
        ...wallet,
        moreTransactions: [{ chain: 'solana', value: hash }],
      });

      expect(result.success).toBeFalsy();
    });

    it('rejects the same wallet listed twice', () => {
      const row = { chain: 'ethereum', value: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' };

      expect(
        CreateClaimValidation.safeParse({ ...wallet, moreReceiving: [row, row] }).success,
      ).toBeFalsy();
    });

    it('has none by default', () => {
      const result = CreateClaimValidation.safeParse(wallet);

      expect(result.success && result.data.moreAffected).toStrictEqual([]);
    });
  });

  describe('paid another way', () => {
    it('accepts a transaction hash and an unknown operator', () => {
      expect(CreateClaimValidation.safeParse(exchange).success).toBeTruthy();
    });

    it('does not need a transaction hash, because many people do not have one', () => {
      expect(CreateClaimValidation.safeParse({ ...exchange, txHash: '' }).success).toBeTruthy();
    });

    it('still rejects a transaction hash that does not fit the chain', () => {
      expect(CreateClaimValidation.safeParse({ ...exchange, txHash: 'nope' }).success).toBeFalsy();
    });

    it('accepts a payment by bank or card with no chain details', () => {
      for (const paymentMethod of ['bank_card', 'other']) {
        expect(
          CreateClaimValidation.safeParse({
            fraudTypes: ['romance_scam'],
            paymentMethod,
            chain: 'other',
            unknownOperator: 'on',
          }).success,
        ).toBeTruthy();
      }
    });
  });

  describe('what happened', () => {
    it('accepts any listed kind of fraud, and a description of something else', () => {
      const claim = CreateClaimValidation.safeParse({
        ...exchange,
        fraudTypes: ['phishing', 'hack_exploit', 'other'],
        fraudDescription: 'A fake invoice from a supplier',
      });

      expect(claim.success && claim.data.fraudDescription).toBe('A fake invoice from a supplier');
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

  it('accepts more than one kind of loss and needs at least one', () => {
    expect(
      CreateClaimValidation.safeParse({
        ...wallet,
        fraudTypes: ['investment_platform', 'account_takeover'],
      }).success,
    ).toBeTruthy();
    expect(CreateClaimValidation.safeParse({ ...wallet, fraudTypes: [] }).success).toBeFalsy();
  });

  it('rejects an unknown chain, fraud type or payment method', () => {
    expect(CreateClaimValidation.safeParse({ ...wallet, chain: 'notachain' }).success).toBeFalsy();
    expect(
      CreateClaimValidation.safeParse({ ...wallet, fraudTypes: ['market_loss'] }).success,
    ).toBeFalsy();
    expect(
      CreateClaimValidation.safeParse({ ...wallet, paymentMethod: 'barter' }).success,
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

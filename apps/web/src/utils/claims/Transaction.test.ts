import { describe, expect, it } from 'vitest';
import {
  decodeSymbol,
  describeAmounts,
  decodeTransferLog,
  formatUnits,
  sentFromWallet,
  toStoredCheck,
  transferTopic,
} from './Transaction';
import type { TxFacts } from './Transaction';

const pad = (address: string) => `0x${address.replace('0x', '').padStart(64, '0')}`;
const sender = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const receiver = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';

describe(formatUnits, () => {
  it('shows a token amount with its decimals', () => {
    expect(formatUnits(1_500_000n, 6)).toBe('1.5');
    expect(formatUnits(12_400_000_000n, 6)).toBe('12400');
  });

  it('shows an amount of ether', () => {
    expect(formatUnits(500_000_000_000_000_000n, 18)).toBe('0.5');
  });

  it('cuts extra decimals instead of rounding them up', () => {
    expect(formatUnits(1_999_999_999_999_999_999n, 18)).toBe('1.999999');
  });

  it('does not show a tiny amount as zero', () => {
    expect(formatUnits(31_337n, 18)).toBe('<0.000001');
  });

  it('shows zero', () => {
    expect(formatUnits(0n, 18)).toBe('0');
  });
});

describe(decodeTransferLog, () => {
  const log = {
    address: '0xDAC17F958D2EE523A2206206994597C13D831EC7',
    topics: [transferTopic, pad(sender), pad(receiver)],
    data: `0x${12_400_000_000n.toString(16).padStart(64, '0')}`,
  };

  it('reads who sent how much to whom', () => {
    expect(decodeTransferLog(log)).toStrictEqual({
      contract: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      from: sender,
      to: receiver,
      value: 12_400_000_000n,
    });
  });

  it('ignores a log that is not a transfer', () => {
    expect(
      decodeTransferLog({ ...log, topics: ['0x1234', pad(sender), pad(receiver)] }),
    ).toBeNull();
  });

  it('ignores an NFT transfer, which has a fourth topic', () => {
    expect(decodeTransferLog({ ...log, topics: [...log.topics, pad('0x1')] })).toBeNull();
  });
});

describe(decodeSymbol, () => {
  it('reads an ABI-encoded string', () => {
    const hex = `0x${'20'.padStart(64, '0')}${'4'.padStart(64, '0')}${'55534454'.padEnd(64, '0')}`;

    expect(decodeSymbol(hex)).toBe('USDT');
  });

  it('reads 32 raw bytes', () => {
    expect(decodeSymbol(`0x${'4d4b52'.padEnd(64, '0')}`)).toBe('MKR');
  });

  it('gives null for an answer it cannot read', () => {
    expect(decodeSymbol('0x')).toBeNull();
  });
});

describe(sentFromWallet, () => {
  it('compares addresses without regard to case', () => {
    expect(sentFromWallet(sender, sender.toUpperCase().replace('0X', '0x'))).toBeTruthy();
  });

  it('tells a different wallet apart', () => {
    expect(sentFromWallet(sender, receiver)).toBeFalsy();
  });
});

describe(toStoredCheck, () => {
  const now = new Date('2026-10-27T10:00:00Z');
  const facts: TxFacts = {
    state: 'success',
    from: sender,
    to: receiver,
    native: null,
    tokens: [],
    at: '2026-09-14T09:00:00.000Z',
  };

  it('keeps what was found and how the wallet appears in it', () => {
    expect(toStoredCheck({ status: 'found', facts }, sender, now)).toStrictEqual({
      checkedAt: '2026-10-27T10:00:00.000Z',
      status: 'found',
      facts,
      role: 'sender',
    });
  });

  it('keeps no role when the claim has no wallet', () => {
    expect(toStoredCheck({ status: 'found', facts }, '', now)?.role).toBeNull();
  });

  it('keeps that the chain showed nothing for the ID', () => {
    expect(toStoredCheck({ status: 'not_found' }, sender, now)?.status).toBe('not_found');
  });

  it('keeps nothing when the chain could not be asked', () => {
    expect(toStoredCheck({ status: 'unavailable' }, sender, now)).toBeNull();
    expect(toStoredCheck({ status: 'unsupported' }, sender, now)).toBeNull();
  });
});

describe(describeAmounts, () => {
  const base = { state: 'success', from: sender, to: receiver, at: null } as const;

  it('lists the coin and each token', () => {
    expect(
      describeAmounts({
        ...base,
        native: { amount: '0.5', symbol: 'ETH' },
        tokens: [
          {
            contract: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            from: sender,
            to: receiver,
            amount: '12400',
            symbol: 'USDT',
          },
        ],
      }),
    ).toStrictEqual(['0.5 ETH', '12400 USDT']);
  });

  it('names a token with no readable symbol by its contract', () => {
    expect(
      describeAmounts({
        ...base,
        native: null,
        tokens: [
          {
            contract: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            from: sender,
            to: receiver,
            amount: '5',
            symbol: null,
          },
        ],
      }),
    ).toStrictEqual(['5 0xdac17f95']);
  });
});

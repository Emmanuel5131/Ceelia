import { describe, expect, it } from 'vitest';
import { explorerLink, signingTool } from './explorers';

const hash = `0x${'a'.repeat(64)}`;

describe(explorerLink, () => {
  it('links an Ethereum transaction to Etherscan', () => {
    expect(explorerLink('ethereum', 'tx', hash)).toStrictEqual({
      name: 'Etherscan',
      url: `https://etherscan.io/tx/${hash}`,
    });
  });

  it('links an address to the explorer of its chain', () => {
    const address = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

    expect(explorerLink('bsc', 'address', address)?.url).toBe(`https://bscscan.com/address/${address}`);
    expect(explorerLink('base', 'address', address)?.name).toBe('BaseScan');
  });

  it('uses each explorer own address and transaction paths', () => {
    const solana = 'FyYCUXbRD5Vt2NrtZbSUfkUDryMZpad5CsrmZNmgeEnU';

    expect(explorerLink('solana', 'address', solana)?.url).toBe(
      `https://solscan.io/account/${solana}`,
    );
    expect(explorerLink('tron', 'tx', 'b'.repeat(64))?.url).toBe(
      `https://tronscan.org/#/transaction/${'b'.repeat(64)}`,
    );
  });

  it('gives no link for a chain without a known explorer', () => {
    expect(explorerLink('other', 'tx', hash)).toBeNull();
    expect(explorerLink('evm', 'address', hash)).toBeNull();
  });

  it('gives no link for a value that is not plain letters and digits', () => {
    expect(explorerLink('ethereum', 'tx', '0xabc/../../evil')).toBeNull();
    expect(explorerLink('ethereum', 'tx', 'abc')).toBeNull();
    expect(explorerLink('ethereum', 'tx', '')).toBeNull();
  });
});

describe('signingTool', () => {
  it('gives Etherscan for every Ethereum-style chain and Tronscan for Tron', () => {
    expect(signingTool('celo')?.name).toBe('Etherscan');
    expect(signingTool('base')?.name).toBe('Etherscan');
    expect(signingTool('tron')?.name).toBe('Tronscan');
  });

  it('gives nothing for a chain with no signing page', () => {
    expect(signingTool('solana')).toBeNull();
    expect(signingTool('bitcoin')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { chainFamily, chainIds, chains, getChain } from './chains';

describe('chains', () => {
  it('has a unique id for every chain', () => {
    expect(new Set(chainIds).size).toBe(chains.length);
  });

  it('puts the popular chains first', () => {
    const firstOthers = chains.findIndex((chain) => !('popular' in chain));

    expect(chains.slice(0, firstOthers).every((chain) => 'popular' in chain)).toBe(true);
    expect(chains.slice(firstOthers).some((chain) => 'popular' in chain)).toBe(false);
  });

  it('puts every EVM network in the evm family', () => {
    expect(['ethereum', 'bsc', 'polygon', 'arbitrum', 'base'].map((id) => chainFamily(id as 'ethereum'))).toEqual([
      'evm',
      'evm',
      'evm',
      'evm',
      'evm',
    ]);
  });

  it('keeps chains we cannot check in the other family', () => {
    expect(chainFamily('litecoin')).toBe('other');
    expect(chainFamily('ton')).toBe('other');
  });

  it('finds a chain by id', () => {
    expect(getChain('tron').name).toBe('Tron');
  });
});

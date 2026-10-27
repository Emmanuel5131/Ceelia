import { describe, expect, it } from 'vitest';
import { platformHost, platformKey } from './platform';

describe('platformKey', () => {
  it('treats spacing, case and punctuation as one platform', () => {
    expect(platformKey('Quantum-Fi')).toBe('quantumfi');
    expect(platformKey(' quantum fi ')).toBe('quantumfi');
    expect(platformKey('QuantumFi')).toBe('quantumfi');
  });

  it('removes accents', () => {
    expect(platformKey('Café Coin')).toBe('cafecoin');
  });

  it('keeps digits', () => {
    expect(platformKey('Bet365 Pro')).toBe('bet365pro');
  });
});

describe('platformHost', () => {
  it('reduces an address to its host', () => {
    expect(platformHost('https://www.Quantum.fi/invest?ref=1')).toBe('quantum.fi');
  });

  it('returns undefined for something that is not an address', () => {
    expect(platformHost('quantum fi')).toBeUndefined();
  });
});

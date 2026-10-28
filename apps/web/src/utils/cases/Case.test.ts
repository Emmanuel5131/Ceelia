import { describe, expect, it } from 'vitest';
import { readyToBuild } from './Case';

describe(readyToBuild, () => {
  it('needs five confirmed claims and a thousand dollars', () => {
    expect(readyToBuild(5, 1000)).toBeTruthy();
  });

  it('is not ready with four confirmed claims', () => {
    expect(readyToBuild(4, 500_000)).toBeFalsy();
  });

  it('is not ready below a thousand dollars', () => {
    expect(readyToBuild(50, 999)).toBeFalsy();
  });

  it('is not ready without an estimate', () => {
    expect(readyToBuild(50, null)).toBeFalsy();
  });
});

import { describe, expect, it } from 'vitest';
import { dailyLimit } from './warmup';

const start = new Date('2026-10-01T00:00:00Z');
const day = (n: number) => new Date(start.getTime() + n * 24 * 60 * 60 * 1000);

describe(dailyLimit, () => {
  it('allows nothing before sending begins', () => {
    expect(dailyLimit(start, day(-1), 10_000)).toBe(0);
  });

  it('starts at 50 on the first day', () => {
    expect(dailyLimit(start, day(0), 10_000)).toBe(50);
  });

  it('grows every day', () => {
    expect(dailyLimit(start, day(5), 10_000)).toBeGreaterThan(dailyLimit(start, day(4), 10_000));
  });

  it('never passes the ceiling', () => {
    expect(dailyLimit(start, day(60), 2000)).toBe(2000);
  });

  it('stays under a thousand in the first week', () => {
    expect(dailyLimit(start, day(7), 100_000)).toBeLessThan(1000);
  });
});

const startingLimit = 50;
const growthPerDay = 1.25;
const dayMs = 24 * 60 * 60 * 1000;

/**
 * How many emails may go out in one day while a new sending address builds a reputation. It starts at 50 and grows 25% a day,
 * so it reaches about 1,100 after two weeks and about 25,000 after four, and never passes the ceiling. Big providers
 * throttle or block a new address that suddenly sends a lot.
 * @param startedOn - The day sending began.
 * @param today - The current time.
 * @param ceiling - The most to send in a day once warmed up.
 * @returns The limit for today; 0 before sending has begun.
 */
export function dailyLimit(startedOn: Date, today: Date, ceiling: number) {
  const days = Math.floor((today.getTime() - startedOn.getTime()) / dayMs);

  if (days < 0) {
    return 0;
  }

  return Math.min(ceiling, Math.floor(startingLimit * growthPerDay ** days));
}

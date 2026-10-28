import { Env } from '@/libs/Env';
import { getBaseUrl } from '@/utils/Helpers';

/**
 * Stands in for the production scheduler while developing: it calls the send route every few seconds, so mail queued by an
 * action reaches the local inbox without a manual request. It does nothing when `CRON_SECRET` is not set.
 */
const EVERY = 10_000;

if (!Env.CRON_SECRET) {
  console.warn('CRON_SECRET is not set, so queued mail will not be sent.');
  process.exit(0);
}

const url = `${getBaseUrl()}/api/notifications/drain`;

setInterval(async () => {
  // The app may still be starting, or restarting after an edit; the next round tries again.
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${Env.CRON_SECRET}` },
  }).catch(() => null);

  if (response && !response.ok) {
    console.warn(`Mail drain answered ${response.status}`);
  }
}, EVERY);

import { useTranslations } from 'next-intl';
import type { ClaimSignal } from '@/utils/claims/Signals';

/**
 * The translated reason for each signal staff are shown beside a claim.
 * @returns The labels, by signal.
 */
export function useSignalLabels(): Record<ClaimSignal, string> {
  const t = useTranslations('Staff');

  return {
    wallet_signed_elsewhere: t('signal_wallet_signed_elsewhere'),
    wallet_shared: t('signal_wallet_shared'),
    tx_shared: t('signal_tx_shared'),
    tx_missing: t('signal_tx_missing'),
    tx_not_theirs: t('signal_tx_not_theirs'),
    burst: t('signal_burst'),
  };
}

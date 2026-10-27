import { useTranslations } from 'next-intl';
import { ChainLabel } from '@/components/claims/ChainLabel';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { shortReference } from '@/components/claims/claim-row';
import type { Claim } from '@/libs/Claims';

/**
 * The details line of a claim: what kind of loss it is, on which chain, and the wallet or the transaction. Only the start and
 * end of a long address are shown.
 * @param props - The meta props.
 * @param props.claim - The claim.
 * @returns The line.
 */
export function ClaimMeta(props: { claim: Claim }) {
  const labels = useClaimLabels();
  const reference = props.claim.walletAddress ?? props.claim.txHash ?? '';

  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span>
        {(props.claim.fraudTypes.length > 0 ? props.claim.fraudTypes : [props.claim.fraudType])
          .map((type) => labels.fraudType[type])
          .join(', ')}
      </span>
      <ChainLabel chain={props.claim.chain} />
      <span className="font-mono text-sm">{shortReference(reference)}</span>
    </span>
  );
}

/**
 * The name to show for who took the money, or a translated "unknown" when the person does not know it.
 * @param props - The name props.
 * @param props.name - The operator's name, if given.
 * @returns The name.
 */
export function OperatorName(props: { name: string | null }) {
  const t = useTranslations('ClaimPage');

  return props.name ?? t('operator_unknown');
}

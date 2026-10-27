import type { ChainId } from '@celia/core';
import { getChain } from '@celia/core';
import { useTranslations } from 'next-intl';
import { ChainIcon } from '@/components/claims/ChainIcon';

/**
 * The display name of a chain. Chains are proper names, so they come from `@celia/core`; only the two catch-alls are words
 * that need translating.
 * @returns A function from a chain id to its name.
 */
export function useChainName() {
  const t = useTranslations('ClaimPage');

  return (id: ChainId) => {
    if (id === 'evm') {
      return t('chain_evm');
    }

    return id === 'other' ? t('chain_other') : getChain(id).name;
  };
}

/**
 * A chain's logo and name, side by side.
 * @param props - The label props.
 * @param props.chain - The chain id.
 * @returns The label.
 */
export function ChainLabel(props: { chain: ChainId }) {
  const chainName = useChainName();

  return (
    <span className="inline-flex items-center gap-2">
      <ChainIcon chain={props.chain} />
      {chainName(props.chain)}
    </span>
  );
}

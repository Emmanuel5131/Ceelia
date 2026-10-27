'use client';

import { chains } from '@celia/core';
import type { ChainId } from '@celia/core';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { ChainIcon } from '@/components/claims/ChainIcon';
import { useChainName } from '@/components/claims/ChainLabel';
import { Combobox } from '@/components/ui/combobox';

/**
 * The chain picker for a claim: every chain we list, with its logo, a search box, and the most common ones first. The chosen
 * chain's id is sent in the form under `name`.
 * @param props - The picker props.
 * @param props.id - The id for the trigger, so a label can point at it.
 * @param props.name - The form field that receives the chain id.
 * @param props.defaultValue - The chain chosen to begin with. Ethereum when not given.
 * @returns The picker.
 */
export function ChainSelect(props: { id: string; name: string; defaultValue?: ChainId }) {
  const t = useTranslations('ClaimPage');
  const chainName = useChainName();
  const [value, setValue] = React.useState<ChainId>(props.defaultValue ?? 'ethereum');

  const items = chains.map((chain) => ({
    value: chain.id,
    label: chainName(chain.id),
    icon: <ChainIcon chain={chain.id} />,
    group: 'popular' in chain ? t('chain_popular') : t('chain_all'),
  }));

  return (
    <Combobox
      id={props.id}
      name={props.name}
      items={items}
      value={value}
      onValueChange={(next) => {
        const chain = chains.find((c) => c.id === next);

        if (chain) {
          setValue(chain.id);
        }
      }}
      searchPlaceholder={t('chain_search')}
      emptyText={t('chain_empty')}
    />
  );
}

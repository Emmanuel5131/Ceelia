import { explorerLink } from '@celia/core';
import type { ChainId } from '@celia/core';
import { ArrowSquareOutIcon } from '@phosphor-icons/react/ssr';
import { useTranslations } from 'next-intl';

/**
 * A link that opens a transaction or a wallet on the chain's block explorer, such as Etherscan, in a new tab, so anyone can check
 * it for themselves. It shows nothing for a chain with no explorer we know.
 * @param props - The link props.
 * @param props.chain - The chain.
 * @param props.kind - Whether the value is a transaction hash or a wallet address.
 * @param props.value - The hash or the address.
 * @param props.compact - Show only the small arrow, for a row that already names what it is. The words stay for screen readers.
 * @returns The link, or nothing.
 */
export function ExplorerLink(props: {
  chain: ChainId;
  kind: 'tx' | 'address';
  value: string;
  compact?: boolean;
}) {
  const t = useTranslations('Explorer');
  const link = explorerLink(props.chain, props.kind, props.value);

  if (!link) {
    return null;
  }

  const label = t('view_on', { name: link.name });

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className={
        props.compact
          ? 'inline-flex items-center text-ink-muted focus-ring hover:text-ink'
          : 'inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4 focus-ring hover:text-ink-muted'
      }
    >
      <span className={props.compact ? 'sr-only' : undefined}>{label}</span>
      <ArrowSquareOutIcon aria-hidden="true" />
    </a>
  );
}

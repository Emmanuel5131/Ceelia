import type { ChainFamily } from './families';

type ChainInfo = {
  id: string;
  /** The name people know it by. `evm` and `other` are catch-alls, so the app translates their names. */
  name: string;
  /** Decides how the address is checked and whether an ownership signature can be checked. */
  family: ChainFamily;
  /** Shown first in the list. */
  popular?: true;
};

/**
 * The chains a claim can be filed for. The list is long on purpose (the pitch is all chains), ordered with the ones where
 * losses most often happen first. A chain only needs an entry here and an icon in the web app. Chains we cannot check yet
 * use the `other` family: the claim is accepted, and the address and ownership are marked not confirmed.
 */
export const chains = [
  { id: 'ethereum', name: 'Ethereum', family: 'evm', popular: true },
  { id: 'tron', name: 'Tron', family: 'tron', popular: true },
  { id: 'bsc', name: 'BNB Chain', family: 'evm', popular: true },
  { id: 'solana', name: 'Solana', family: 'solana', popular: true },
  { id: 'bitcoin', name: 'Bitcoin', family: 'bitcoin', popular: true },
  { id: 'polygon', name: 'Polygon', family: 'evm', popular: true },
  { id: 'arbitrum', name: 'Arbitrum One', family: 'evm', popular: true },
  { id: 'base', name: 'Base', family: 'evm', popular: true },
  { id: 'optimism', name: 'Optimism', family: 'evm' },
  { id: 'avalanche', name: 'Avalanche', family: 'evm' },
  { id: 'linea', name: 'Linea', family: 'evm' },
  { id: 'zksync', name: 'zkSync Era', family: 'evm' },
  { id: 'scroll', name: 'Scroll', family: 'evm' },
  { id: 'blast', name: 'Blast', family: 'evm' },
  { id: 'mantle', name: 'Mantle', family: 'evm' },
  { id: 'cronos', name: 'Cronos', family: 'evm' },
  { id: 'fantom', name: 'Fantom', family: 'evm' },
  { id: 'sonic', name: 'Sonic', family: 'evm' },
  { id: 'gnosis', name: 'Gnosis', family: 'evm' },
  { id: 'celo', name: 'Celo', family: 'evm' },
  { id: 'opbnb', name: 'opBNB', family: 'evm' },
  { id: 'polygon-zkevm', name: 'Polygon zkEVM', family: 'evm' },
  { id: 'pulsechain', name: 'PulseChain', family: 'evm' },
  { id: 'ronin', name: 'Ronin', family: 'evm' },
  { id: 'moonbeam', name: 'Moonbeam', family: 'evm' },
  { id: 'aurora', name: 'Aurora', family: 'evm' },
  { id: 'kava', name: 'Kava', family: 'evm' },
  { id: 'metis', name: 'Metis', family: 'evm' },
  { id: 'mode', name: 'Mode', family: 'evm' },
  { id: 'zora', name: 'Zora', family: 'evm' },
  { id: 'berachain', name: 'Berachain', family: 'evm' },
  { id: 'unichain', name: 'Unichain', family: 'evm' },
  { id: 'hyperevm', name: 'HyperEVM', family: 'evm' },
  { id: 'kaia', name: 'Kaia', family: 'evm' },
  { id: 'ethereum-classic', name: 'Ethereum Classic', family: 'evm' },
  { id: 'litecoin', name: 'Litecoin', family: 'other' },
  { id: 'dogecoin', name: 'Dogecoin', family: 'other' },
  { id: 'bitcoin-cash', name: 'Bitcoin Cash', family: 'other' },
  { id: 'xrp', name: 'XRP Ledger', family: 'other' },
  { id: 'ton', name: 'TON', family: 'other' },
  { id: 'cardano', name: 'Cardano', family: 'other' },
  { id: 'cosmos', name: 'Cosmos Hub', family: 'other' },
  { id: 'polkadot', name: 'Polkadot', family: 'other' },
  { id: 'near', name: 'NEAR', family: 'other' },
  { id: 'aptos', name: 'Aptos', family: 'other' },
  { id: 'sui', name: 'Sui', family: 'other' },
  { id: 'stellar', name: 'Stellar', family: 'other' },
  { id: 'algorand', name: 'Algorand', family: 'other' },
  { id: 'tezos', name: 'Tezos', family: 'other' },
  { id: 'filecoin', name: 'Filecoin', family: 'other' },
  { id: 'hedera', name: 'Hedera', family: 'other' },
  { id: 'kaspa', name: 'Kaspa', family: 'other' },
  { id: 'zcash', name: 'Zcash', family: 'other' },
  { id: 'eos', name: 'EOS', family: 'other' },
  { id: 'starknet', name: 'Starknet', family: 'other' },
  { id: 'evm', name: 'Other EVM network', family: 'evm' },
  { id: 'other', name: 'Another chain', family: 'other' },
] as const satisfies readonly ChainInfo[];

export type ChainId = (typeof chains)[number]['id'];

/** Every chain id, for a validation schema. */
export const chainIds: ChainId[] = chains.map((chain) => chain.id);

const anotherChain: ChainInfo = { id: 'other', name: 'Another chain', family: 'other' };

/**
 * Finds a chain by its id.
 * @param id - A chain id.
 * @returns The chain's details.
 */
export function getChain(id: ChainId): ChainInfo {
  return chains.find((chain) => chain.id === id) ?? anotherChain;
}

/**
 * Tells which family a chain belongs to, which decides how its addresses and signatures are checked.
 * @param id - A chain id.
 * @returns The chain family.
 */
export function chainFamily(id: ChainId) {
  return getChain(id).family;
}

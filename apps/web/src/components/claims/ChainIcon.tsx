'use client';

import type { ChainId } from '@celia/core';
import { CubeIcon, LinkSimpleIcon } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';

const NetworkAlgorand = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkAlgorand'),
);
const NetworkAptos = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkAptos'),
);
const NetworkArbitrumOne = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkArbitrumOne'),
);
const NetworkAurora = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkAurora'),
);
const NetworkAvalanche = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkAvalanche'),
);
const NetworkBase = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkBase'),
);
const NetworkBerachain = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkBerachain'),
);
const NetworkBinanceSmartChain = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkBinanceSmartChain'),
);
const NetworkBitcoin = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkBitcoin'),
);
const NetworkBitcoinCash = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkBitcoinCash'),
);
const NetworkBlast = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkBlast'),
);
const NetworkCardano = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkCardano'),
);
const NetworkCelo = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkCelo'),
);
const NetworkCosmosHub = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkCosmosHub'),
);
const NetworkCronos = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkCronos'),
);
const NetworkDogecoin = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkDogecoin'),
);
const NetworkEos = dynamic(async () => await import('@web3icons/react/icons/networks/NetworkEos'));
const NetworkEthereum = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkEthereum'),
);
const NetworkEthereumClassic = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkEthereumClassic'),
);
const NetworkFantom = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkFantom'),
);
const NetworkFilecoin = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkFilecoin'),
);
const NetworkGnosis = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkGnosis'),
);
const NetworkHederaHashgraph = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkHederaHashgraph'),
);
const NetworkHyperEvm = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkHyperEvm'),
);
const NetworkKaia = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkKaia'),
);
const NetworkKaspa = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkKaspa'),
);
const NetworkKava = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkKava'),
);
const NetworkLinea = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkLinea'),
);
const NetworkLitecoin = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkLitecoin'),
);
const NetworkMantle = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkMantle'),
);
const NetworkMetisAndromeda = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkMetisAndromeda'),
);
const NetworkMode = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkMode'),
);
const NetworkMoonbeam = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkMoonbeam'),
);
const NetworkNearProtocol = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkNearProtocol'),
);
const NetworkOpbnb = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkOpbnb'),
);
const NetworkOptimism = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkOptimism'),
);
const NetworkPolkadot = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkPolkadot'),
);
const NetworkPolygon = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkPolygon'),
);
const NetworkPolygonZkevm = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkPolygonZkevm'),
);
const NetworkPulsechain = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkPulsechain'),
);
const NetworkRonin = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkRonin'),
);
const NetworkScroll = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkScroll'),
);
const NetworkSolana = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkSolana'),
);
const NetworkSonic = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkSonic'),
);
const NetworkStarknet = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkStarknet'),
);
const NetworkStellar = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkStellar'),
);
const NetworkSui = dynamic(async () => await import('@web3icons/react/icons/networks/NetworkSui'));
const NetworkTezos = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkTezos'),
);
const NetworkTon = dynamic(async () => await import('@web3icons/react/icons/networks/NetworkTon'));
const NetworkTron = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkTron'),
);
const NetworkUnichain = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkUnichain'),
);
const NetworkXrp = dynamic(async () => await import('@web3icons/react/icons/networks/NetworkXrp'));
const NetworkZcash = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkZcash'),
);
const NetworkZksync = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkZksync'),
);
const NetworkZora = dynamic(
  async () => await import('@web3icons/react/icons/networks/NetworkZora'),
);

// Chain logos are brand marks, so they come from @web3icons rather than Phosphor. Each one loads only when a page shows it,
// so the 55 logos are not in every bundle. The two catch-alls use Phosphor icons.
// The `Record` means a chain added to `@celia/core` without a logo here fails the type check.
const logos: Record<ChainId, (className: string) => React.ReactElement> = {
  ethereum: (className) => (
    <NetworkEthereum variant="branded" className={className} aria-hidden="true" />
  ),
  tron: (className) => <NetworkTron variant="branded" className={className} aria-hidden="true" />,
  bsc: (className) => (
    <NetworkBinanceSmartChain variant="branded" className={className} aria-hidden="true" />
  ),
  solana: (className) => (
    <NetworkSolana variant="branded" className={className} aria-hidden="true" />
  ),
  bitcoin: (className) => (
    <NetworkBitcoin variant="branded" className={className} aria-hidden="true" />
  ),
  polygon: (className) => (
    <NetworkPolygon variant="branded" className={className} aria-hidden="true" />
  ),
  arbitrum: (className) => (
    <NetworkArbitrumOne variant="branded" className={className} aria-hidden="true" />
  ),
  base: (className) => <NetworkBase variant="branded" className={className} aria-hidden="true" />,
  optimism: (className) => (
    <NetworkOptimism variant="branded" className={className} aria-hidden="true" />
  ),
  avalanche: (className) => (
    <NetworkAvalanche variant="branded" className={className} aria-hidden="true" />
  ),
  linea: (className) => <NetworkLinea variant="branded" className={className} aria-hidden="true" />,
  zksync: (className) => (
    <NetworkZksync variant="branded" className={className} aria-hidden="true" />
  ),
  scroll: (className) => (
    <NetworkScroll variant="branded" className={className} aria-hidden="true" />
  ),
  blast: (className) => <NetworkBlast variant="branded" className={className} aria-hidden="true" />,
  mantle: (className) => (
    <NetworkMantle variant="branded" className={className} aria-hidden="true" />
  ),
  cronos: (className) => (
    <NetworkCronos variant="branded" className={className} aria-hidden="true" />
  ),
  fantom: (className) => (
    <NetworkFantom variant="branded" className={className} aria-hidden="true" />
  ),
  sonic: (className) => <NetworkSonic variant="branded" className={className} aria-hidden="true" />,
  gnosis: (className) => (
    <NetworkGnosis variant="branded" className={className} aria-hidden="true" />
  ),
  celo: (className) => <NetworkCelo variant="branded" className={className} aria-hidden="true" />,
  opbnb: (className) => <NetworkOpbnb variant="branded" className={className} aria-hidden="true" />,
  'polygon-zkevm': (className) => (
    <NetworkPolygonZkevm variant="branded" className={className} aria-hidden="true" />
  ),
  pulsechain: (className) => (
    <NetworkPulsechain variant="branded" className={className} aria-hidden="true" />
  ),
  ronin: (className) => <NetworkRonin variant="branded" className={className} aria-hidden="true" />,
  moonbeam: (className) => (
    <NetworkMoonbeam variant="branded" className={className} aria-hidden="true" />
  ),
  aurora: (className) => (
    <NetworkAurora variant="branded" className={className} aria-hidden="true" />
  ),
  kava: (className) => <NetworkKava variant="branded" className={className} aria-hidden="true" />,
  metis: (className) => (
    <NetworkMetisAndromeda variant="branded" className={className} aria-hidden="true" />
  ),
  mode: (className) => <NetworkMode variant="branded" className={className} aria-hidden="true" />,
  zora: (className) => <NetworkZora variant="branded" className={className} aria-hidden="true" />,
  berachain: (className) => (
    <NetworkBerachain variant="branded" className={className} aria-hidden="true" />
  ),
  unichain: (className) => (
    <NetworkUnichain variant="branded" className={className} aria-hidden="true" />
  ),
  hyperevm: (className) => (
    <NetworkHyperEvm variant="branded" className={className} aria-hidden="true" />
  ),
  kaia: (className) => <NetworkKaia variant="branded" className={className} aria-hidden="true" />,
  'ethereum-classic': (className) => (
    <NetworkEthereumClassic variant="branded" className={className} aria-hidden="true" />
  ),
  litecoin: (className) => (
    <NetworkLitecoin variant="branded" className={className} aria-hidden="true" />
  ),
  dogecoin: (className) => (
    <NetworkDogecoin variant="branded" className={className} aria-hidden="true" />
  ),
  'bitcoin-cash': (className) => (
    <NetworkBitcoinCash variant="branded" className={className} aria-hidden="true" />
  ),
  xrp: (className) => <NetworkXrp variant="branded" className={className} aria-hidden="true" />,
  ton: (className) => <NetworkTon variant="branded" className={className} aria-hidden="true" />,
  cardano: (className) => (
    <NetworkCardano variant="branded" className={className} aria-hidden="true" />
  ),
  cosmos: (className) => (
    <NetworkCosmosHub variant="branded" className={className} aria-hidden="true" />
  ),
  polkadot: (className) => (
    <NetworkPolkadot variant="branded" className={className} aria-hidden="true" />
  ),
  near: (className) => (
    <NetworkNearProtocol variant="branded" className={className} aria-hidden="true" />
  ),
  aptos: (className) => <NetworkAptos variant="branded" className={className} aria-hidden="true" />,
  sui: (className) => <NetworkSui variant="branded" className={className} aria-hidden="true" />,
  stellar: (className) => (
    <NetworkStellar variant="branded" className={className} aria-hidden="true" />
  ),
  algorand: (className) => (
    <NetworkAlgorand variant="branded" className={className} aria-hidden="true" />
  ),
  tezos: (className) => <NetworkTezos variant="branded" className={className} aria-hidden="true" />,
  filecoin: (className) => (
    <NetworkFilecoin variant="branded" className={className} aria-hidden="true" />
  ),
  hedera: (className) => (
    <NetworkHederaHashgraph variant="branded" className={className} aria-hidden="true" />
  ),
  kaspa: (className) => <NetworkKaspa variant="branded" className={className} aria-hidden="true" />,
  zcash: (className) => <NetworkZcash variant="branded" className={className} aria-hidden="true" />,
  eos: (className) => <NetworkEos variant="branded" className={className} aria-hidden="true" />,
  starknet: (className) => (
    <NetworkStarknet variant="branded" className={className} aria-hidden="true" />
  ),
  evm: (className) => <CubeIcon className={className} aria-hidden="true" />,
  other: (className) => <LinkSimpleIcon className={className} aria-hidden="true" />,
};

/**
 * The logo of a chain, at the size of the text around it.
 * @param props - The icon props.
 * @param props.chain - The chain id.
 * @param props.className - Extra classes, for example a size.
 * @returns The logo.
 */
export function ChainIcon(props: { chain: ChainId; className?: string }) {
  return logos[props.chain](props.className ?? 'size-5');
}

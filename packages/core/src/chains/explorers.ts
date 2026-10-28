import type { ChainId } from './chains';
import { chainFamily } from './chains';

type Explorer = {
  /** The name people know it by. */
  name: string;
  /** The site, without a trailing slash. */
  site: string;
  /** Where a transaction page lives under the site. Most explorers use `/tx`. */
  txPath: string;
  /** Where an address page lives under the site. Most explorers use `/address`. */
  addressPath: string;
};

const scan = (name: string, site: string): Explorer => ({
  name,
  site,
  txPath: '/tx',
  addressPath: '/address',
});

/** The explorer to send people to for each chain that has a well-known one. A chain not listed has no link. */
const explorers: Partial<Record<ChainId, Explorer>> = {
  ethereum: scan('Etherscan', 'https://etherscan.io'),
  bsc: scan('BscScan', 'https://bscscan.com'),
  polygon: scan('PolygonScan', 'https://polygonscan.com'),
  arbitrum: scan('Arbiscan', 'https://arbiscan.io'),
  base: scan('BaseScan', 'https://basescan.org'),
  optimism: scan('Optimistic Etherscan', 'https://optimistic.etherscan.io'),
  avalanche: scan('Snowtrace', 'https://snowtrace.io'),
  linea: scan('LineaScan', 'https://lineascan.build'),
  scroll: scan('ScrollScan', 'https://scrollscan.com'),
  blast: scan('BlastScan', 'https://blastscan.io'),
  mantle: scan('MantleScan', 'https://mantlescan.xyz'),
  cronos: scan('Cronoscan', 'https://cronoscan.com'),
  fantom: scan('FTMScan', 'https://ftmscan.com'),
  gnosis: scan('GnosisScan', 'https://gnosisscan.io'),
  celo: scan('CeloScan', 'https://celoscan.io'),
  opbnb: scan('opBNBScan', 'https://opbnb.bscscan.com'),
  'polygon-zkevm': scan('PolygonScan', 'https://zkevm.polygonscan.com'),
  sonic: scan('SonicScan', 'https://sonicscan.org'),
  moonbeam: scan('Moonscan', 'https://moonscan.io'),
  zksync: scan('zkSync Explorer', 'https://explorer.zksync.io'),
  'ethereum-classic': scan('Blockscout', 'https://etc.blockscout.com'),
  solana: { name: 'Solscan', site: 'https://solscan.io', txPath: '/tx', addressPath: '/account' },
  tron: {
    name: 'Tronscan',
    site: 'https://tronscan.org/#',
    txPath: '/transaction',
    addressPath: '/address',
  },
  bitcoin: scan('mempool.space', 'https://mempool.space'),
};

// What an address or hash is made of on every chain listed above: letters and digits only, so nothing can change the link.
const safeValue = /^[A-Za-z0-9]{8,128}$/u;

/**
 * The link to a transaction or an address on the chain's block explorer, such as Etherscan, so anyone can check it themselves.
 * It is only a link: Celia does not read the explorer, and the chain analysis does not depend on it.
 * @param chain - The chain.
 * @param kind - Whether the value is a transaction hash or a wallet address.
 * @param value - The hash or the address.
 * @returns The explorer's name and the link, or null when the chain has no explorer we know or the value is not plain letters and digits.
 */
export function explorerLink(chain: ChainId, kind: 'tx' | 'address', value: string) {
  const explorer = explorers[chain];
  const clean = value.trim().replace(/^0x/iu, '');

  if (!explorer || !safeValue.test(clean)) {
    return null;
  }

  const path = kind === 'tx' ? explorer.txPath : explorer.addressPath;
  const given = value.trim();

  return { name: explorer.name, url: `${explorer.site}${path}/${given}` };
}

/**
 * A web page where a person can sign the ownership message for a chain's wallets, when there is a good one. Every
 * Ethereum-style chain signs the same way, so one tool serves them all. Solana has no standalone page: its wallets sign from a
 * site that asks them to, which is what the "sign with my wallet" button does.
 * @param chain - The chain.
 * @returns The tool's name and address, or null when there is none.
 */
export function signingTool(chain: ChainId): { name: 'Etherscan' | 'Tronscan'; url: string } | null {
  const family = chainFamily(chain);

  if (family === 'evm') {
    return { name: 'Etherscan', url: 'https://etherscan.io/verifiedSignatures' };
  }

  return family === 'tron' ? { name: 'Tronscan', url: 'https://tronscan.org' } : null;
}

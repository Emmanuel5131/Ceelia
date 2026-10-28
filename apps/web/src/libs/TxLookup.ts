import type { ChainId } from '@celia/core';
import * as z from 'zod';
import { evmEndpoints, rpcCall, solanaEndpoint } from '@/libs/ChainRpc';
import { logger } from '@/libs/Logger';
import { decodeSymbol, decodeTransferLog, formatUnits } from '@/utils/Transaction';
import type { TxFacts, TxLookup } from '@/utils/Transaction';

/** The coin each chain's fees and plain transfers are paid in. */
const nativeSymbols: Partial<Record<ChainId, string>> = {
  ethereum: 'ETH',
  bsc: 'BNB',
  polygon: 'POL',
  arbitrum: 'ETH',
  base: 'ETH',
  optimism: 'ETH',
  avalanche: 'AVAX',
};

const hex = z.string();

const evmTransaction = z
  .object({
    from: hex,
    to: hex.nullable(),
    value: hex,
    blockNumber: hex.nullable(),
  })
  .nullable();

const evmReceipt = z
  .object({
    status: hex.optional(),
    logs: z.array(z.object({ address: hex, topics: z.array(hex), data: hex })),
  })
  .nullable();

const evmBlock = z.object({ timestamp: hex }).nullable();

// The first few transfers are enough to show where the money went; a swap can have dozens.
const maxTransfers = 5;

async function tokenFacts(url: string, contract: string) {
  const call = async (data: string) =>
    hex
      .parse(await rpcCall(url, 'eth_call', [{ to: contract, data }, 'latest']))
      .replace(/^0x$/u, '');
  const [decimals, symbol] = await Promise.all([call('0x313ce567'), call('0x95d89b41')]).catch(
    () => ['', ''],
  );

  return {
    decimals: decimals ? Number.parseInt(decimals, 16) : 18,
    symbol: symbol ? decodeSymbol(`0x${symbol}`) : null,
  };
}

/**
 * Whether a transaction went through: its receipt says so, and a transaction with no receipt yet is still pending.
 * @param receipt - The transaction receipt, or null when there is none.
 * @param receipt.status - `0x1` when it succeeded.
 * @returns The state.
 */
function stateOf(receipt: { status?: string } | null): TxFacts['state'] {
  if (!receipt) {
    return 'pending';
  }

  // Receipts before the Byzantium upgrade have no status field, and a transaction that was mined then had gone through.
  return receipt.status === undefined || receipt.status === '0x1' ? 'success' : 'failed';
}

async function lookUpEvm(url: string, chain: ChainId, hash: string): Promise<TxLookup> {
  const transaction = evmTransaction.parse(await rpcCall(url, 'eth_getTransactionByHash', [hash]));

  if (!transaction) {
    return { status: 'not_found' };
  }

  const receipt = evmReceipt.parse(await rpcCall(url, 'eth_getTransactionReceipt', [hash]));
  const block = transaction.blockNumber
    ? evmBlock.parse(await rpcCall(url, 'eth_getBlockByNumber', [transaction.blockNumber, false]))
    : null;
  const transfers = (receipt?.logs ?? [])
    .map((log) => decodeTransferLog(log))
    .flatMap((transfer) => (transfer ? [transfer] : []))
    .slice(0, maxTransfers);
  const contracts = [...new Set(transfers.map((transfer) => transfer.contract))];
  const known = new Map(
    await Promise.all(
      contracts.map(async (contract) => [contract, await tokenFacts(url, contract)] as const),
    ),
  );
  const wei = BigInt(transaction.value);
  const hasValue = /[1-9a-f]/iu.test(transaction.value.slice(2));
  const symbol = nativeSymbols[chain] ?? null;
  return {
    status: 'found',
    facts: {
      state: stateOf(receipt),
      from: transaction.from.toLowerCase(),
      to: transaction.to?.toLowerCase() ?? null,
      native: hasValue && symbol ? { amount: formatUnits(wei, 18), symbol } : null,
      tokens: transfers.map((transfer) => {
        const token = known.get(transfer.contract);

        return {
          contract: transfer.contract,
          from: transfer.from,
          to: transfer.to,
          amount: formatUnits(transfer.value, token?.decimals ?? 18),
          symbol: token?.symbol ?? null,
        };
      }),
      at: block ? new Date(Number.parseInt(block.timestamp, 16) * 1000).toISOString() : null,
    },
  };
}

const solanaTransaction = z
  .object({
    blockTime: z.number().nullable(),
    meta: z
      .object({
        err: z.unknown(),
        fee: z.number(),
        preBalances: z.array(z.number()),
        postBalances: z.array(z.number()),
      })
      .nullable(),
    transaction: z.object({
      message: z.object({ accountKeys: z.array(z.object({ pubkey: z.string() })) }),
    }),
  })
  .nullable();

async function lookUpSolana(signature: string): Promise<TxLookup> {
  const found = solanaTransaction.parse(
    await rpcCall(solanaEndpoint, 'getTransaction', [
      signature,
      { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
    ]),
  );
  const payer = found?.transaction.message.accountKeys[0]?.pubkey;

  if (!found || !payer) {
    return { status: 'not_found' };
  }

  // What the first signer lost, less the fee: the SOL that left their account.
  const lamports =
    (found.meta?.preBalances[0] ?? 0) - (found.meta?.postBalances[0] ?? 0) - (found.meta?.fee ?? 0);

  return {
    status: 'found',
    facts: {
      state: found.meta?.err ? 'failed' : 'success',
      from: payer,
      to: null,
      native: lamports > 0 ? { amount: formatUnits(BigInt(lamports), 9), symbol: 'SOL' } : null,
      tokens: [],
      at: found.blockTime ? new Date(found.blockTime * 1000).toISOString() : null,
    },
  };
}

/**
 * Asks a public node what the chain shows for a transaction: who sent it, to whom, how much and when. A chain we have no node
 * for gives `unsupported`, and a node that cannot be reached gives `unavailable`, so a person is told we could not check, not
 * that the transaction is false.
 * @param chain - The chain.
 * @param hash - The transaction hash, or the signature on Solana.
 * @returns What was found.
 */
export async function lookUpTransaction(chain: ChainId, hash: string): Promise<TxLookup> {
  const evm = evmEndpoints[chain];

  if (!evm && chain !== 'solana') {
    return { status: 'unsupported' };
  }

  try {
    return evm ? await lookUpEvm(evm, chain, hash) : await lookUpSolana(hash);
  } catch (error) {
    logger.warn(
      `Transaction lookup on ${chain} failed: ${error instanceof Error ? error.message : String(error)}`,
    );

    return { status: 'unavailable' };
  }
}

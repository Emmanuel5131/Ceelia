import type { ChainId } from '@celia/core';
import * as z from 'zod';

/** Public read-only endpoints for the chains we can look things up on. A chain not listed is not looked up. */
export const evmEndpoints: Partial<Record<ChainId, string>> = {
  ethereum: 'https://ethereum-rpc.publicnode.com',
  bsc: 'https://bsc-rpc.publicnode.com',
  polygon: 'https://polygon-bor-rpc.publicnode.com',
  arbitrum: 'https://arbitrum-one-rpc.publicnode.com',
  base: 'https://base-rpc.publicnode.com',
  optimism: 'https://optimism-rpc.publicnode.com',
  avalanche: 'https://avalanche-c-chain-rpc.publicnode.com',
};

export const solanaEndpoint = 'https://api.mainnet-beta.solana.com';

const resultValidation = z.object({ result: z.unknown() });

/**
 * Calls a JSON-RPC method on a public node. It gives up after four seconds, so a slow node never holds a page.
 * @param url - The node's endpoint.
 * @param method - The RPC method.
 * @param params - The method's parameters.
 * @returns The `result` of the reply, which is `null` when the node has nothing for the question.
 * @throws {Error} When the node cannot be reached, answers too slowly or replies with something that is not JSON-RPC.
 */
export async function rpcCall(url: string, method: string, params: unknown[]) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(4000),
  });

  return resultValidation.parse(await response.json()).result;
}

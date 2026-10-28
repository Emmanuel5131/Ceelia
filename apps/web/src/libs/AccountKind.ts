import type { AccountKind, ChainId } from '@celia/core';
import * as z from 'zod';
import { evmEndpoints, rpcCall, solanaEndpoint } from '@/libs/ChainRpc';

const solanaSystemProgram = '11111111111111111111111111111111';

/**
 * What an EVM address is, from the code stored at it. No code is a regular wallet. So is code that starts `0xef0100`, which is a
 * regular wallet that has delegated to a contract (EIP-7702). Any other code is a smart contract wallet.
 * @param code - The code at the address, as hex.
 * @returns The kind.
 */
export function accountKindOfCode(code: string): AccountKind {
  return code === '0x' || code.toLowerCase().startsWith('0xef0100') ? 'eoa' : 'contract';
}

/**
 * What a Solana account is, from the program that owns it. The system program owns regular wallets; an account owned by any
 * other program is a contract wallet.
 * @param owner - The owner program's address.
 * @returns The kind.
 */
export function accountKindOfOwner(owner: string): AccountKind {
  return owner === solanaSystemProgram ? 'eoa' : 'contract';
}

const codeValidation = z.string();
const accountValidation = z.object({ value: z.object({ owner: z.string() }).nullable() });

async function lookUp(chain: ChainId, address: string): Promise<AccountKind | null> {
  const evm = evmEndpoints[chain];

  if (evm) {
    return accountKindOfCode(
      codeValidation.parse(await rpcCall(evm, 'eth_getCode', [address, 'latest'])),
    );
  }

  if (chain === 'solana') {
    const account = accountValidation.parse(
      await rpcCall(solanaEndpoint, 'getAccountInfo', [address, { encoding: 'base64' }]),
    );

    return account.value ? accountKindOfOwner(account.value.owner) : null;
  }

  return null;
}

/**
 * Reads from the chain whether a wallet address is a regular wallet or a smart contract wallet, so the person is never asked. It
 * gives up after three seconds. A chain that is not covered, an unfunded address or a lookup that fails give null: the claim is
 * filed all the same, only without the kind.
 * @param chain - The chain.
 * @param address - The wallet address.
 * @returns The kind, or null when it could not be read.
 */
export async function detectAccountKind(chain: ChainId, address: string) {
  // A lookup that fails must never stop a claim being filed, so a failure is the same as not knowing.
  return await lookUp(chain, address).catch(() => null);
}

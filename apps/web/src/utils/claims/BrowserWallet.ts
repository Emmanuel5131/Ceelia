import { chainFamily, evmSigner, solanaSigner, tronSigner } from '@celia/core';
import type { ChainId, Eip1193Provider, WalletSigner } from '@celia/core';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// What a wallet extension put on `window`, which the page has no type for.
const injected = (name: string): unknown => Reflect.get(window, name);

// A wallet's method, bound to the wallet so it can be called on its own.
function bound(target: unknown, name: string) {
  const method = isRecord(target) ? target[name] : null;

  return typeof method === 'function'
    ? (...args: unknown[]): unknown => Reflect.apply(method, target, args)
    : null;
}

function ethereumProvider(target: unknown): Eip1193Provider | null {
  const request = bound(target, 'request');

  if (!request) {
    return null;
  }

  return {
    request: async (call) => {
      const result: unknown = await request(call);

      return result;
    },
  };
}

function solanaWallet(): WalletSigner | null {
  const phantom = injected('phantom');
  const target =
    isRecord(phantom) && isRecord(phantom.solana) ? phantom.solana : injected('solana');
  const connect = bound(target, 'connect');
  const signMessage = bound(target, 'signMessage');

  if (!connect || !signMessage || !isRecord(target)) {
    return null;
  }

  return solanaSigner({
    connect: async () => {
      const result: unknown = await connect();

      return result;
    },
    signMessage: async (message, display) => {
      const result: unknown = await signMessage(message, display);

      return result;
    },
    publicKey: target.publicKey,
  });
}

function tronWallet(): WalletSigner | null {
  const provider = ethereumProvider(injected('tronLink'));

  return provider
    ? tronSigner({ request: provider.request, tronWeb: () => injected('tronWeb') })
    : null;
}

/**
 * Finds the wallet in this browser that can sign for a chain: an Ethereum-style wallet such as MetaMask or Rabby, Phantom for
 * Solana, or TronLink for Tron. It is read when the person clicks, because wallet extensions add themselves after the page loads.
 * @param chain - The chain of the claim.
 * @returns The wallet, or null when this browser has none for the chain.
 */
export function findBrowserWallet(chain: ChainId): WalletSigner | null {
  const family = chainFamily(chain);

  if (family === 'evm') {
    const provider = ethereumProvider(injected('ethereum'));

    return provider ? evmSigner(provider) : null;
  }

  if (family === 'solana') {
    return solanaWallet();
  }

  return family === 'tron' ? tronWallet() : null;
}

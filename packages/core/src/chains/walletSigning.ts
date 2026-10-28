import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import { base64 } from '@scure/base';
import type { ChainId } from './chains';
import { chainFamily } from './chains';

/** A wallet a page can talk to: it connects, then signs a text with one of the addresses it connected. */
export type WalletSigner = {
  /** Asks the wallet to connect and returns the addresses it will sign with. */
  connect: () => Promise<string[]>;
  /** Signs the text with the wallet at `address` and returns the signature as the wallet shows it. */
  sign: (address: string, message: string) => Promise<string>;
};

/** Why signing did not give a signature: the person said no, a different wallet is connected, or the wallet failed. */
export type SignFailure = 'rejected' | 'wrong_wallet' | 'failed';

export type SignOutcome = { ok: true; signature: string } | { ok: false; reason: SignFailure };

/** The standard browser wallet interface (EIP-1193), which MetaMask, Rabby, Coinbase Wallet and the rest follow. */
export type Eip1193Provider = {
  request: (call: { method: string; params?: unknown[] }) => Promise<unknown>;
};

/** The part of a Solana wallet such as Phantom that signing needs. */
export type SolanaProvider = {
  connect: () => Promise<unknown>;
  signMessage: (message: Uint8Array, display: 'utf8') => Promise<unknown>;
  publicKey?: unknown;
};

/** The parts of TronLink that signing needs. The Tron object is read after connecting, because that is when it appears. */
export type TronProvider = {
  request: Eip1193Provider['request'];
  tronWeb: () => unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

/** Reads the address of a Solana public key object, or a string. */
function solanaAddress(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (isRecord(value) && typeof value.toBase58 === 'function') {
    const address: unknown = value.toBase58();

    return typeof address === 'string' ? address : null;
  }

  return null;
}

/**
 * Wraps a browser wallet that follows EIP-1193. The text is sent as hex, which every such wallet takes for `personal_sign`.
 * @param provider - The wallet.
 * @returns The signer.
 */
export function evmSigner(provider: Eip1193Provider): WalletSigner {
  return {
    connect: async () => strings(await provider.request({ method: 'eth_requestAccounts' })),
    sign: async (address, message) => {
      const signature = await provider.request({
        method: 'personal_sign',
        params: [`0x${bytesToHex(utf8ToBytes(message))}`, address],
      });

      if (typeof signature !== 'string') {
        throw new TypeError('The wallet gave no signature');
      }

      return signature;
    },
  };
}

/**
 * Wraps a Solana wallet. The signature comes back as bytes, so it is given as base64, which the check reads.
 * @param provider - The wallet.
 * @returns The signer.
 */
export function solanaSigner(provider: SolanaProvider): WalletSigner {
  return {
    connect: async () => {
      const connected = await provider.connect();
      const key = isRecord(connected) ? connected.publicKey : provider.publicKey;
      const address = solanaAddress(key ?? provider.publicKey);

      return address ? [address] : [];
    },
    sign: async (_address, message) => {
      const result = await provider.signMessage(utf8ToBytes(message), 'utf8');
      const signature = isRecord(result) ? result.signature : null;

      if (!(signature instanceof Uint8Array)) {
        throw new TypeError('The wallet gave no signature');
      }

      return base64.encode(signature);
    },
  };
}

/**
 * Wraps TronLink. Its Tron object only exists once the person has connected, so it is read when needed.
 * @param provider - The wallet.
 * @returns The signer.
 */
export function tronSigner(provider: TronProvider): WalletSigner {
  return {
    connect: async () => {
      await provider.request({ method: 'tron_requestAccounts' });
      const tron = provider.tronWeb();
      const defaultAddress = isRecord(tron) ? tron.defaultAddress : null;
      const address = isRecord(defaultAddress) ? defaultAddress.base58 : null;

      return typeof address === 'string' ? [address] : [];
    },
    sign: async (_address, message) => {
      const tron = provider.tronWeb();
      const trx = isRecord(tron) ? tron.trx : null;

      if (!isRecord(trx) || typeof trx.signMessageV2 !== 'function') {
        throw new TypeError('The wallet cannot sign messages');
      }

      const signature: unknown = await trx.signMessageV2(message);

      if (typeof signature !== 'string') {
        throw new TypeError('The wallet gave no signature');
      }

      return signature;
    },
  };
}

// Wallets say no in different words; EIP-1193 gives code 4001, and some give only a message.
function isRejection(error: unknown) {
  if (!isRecord(error)) {
    return false;
  }

  return (
    error.code === 4001 ||
    error.code === 'ACTION_REJECTED' ||
    (typeof error.message === 'string' && /reject|denied|declin|cancel/iu.test(error.message))
  );
}

/**
 * Asks the wallet to sign the ownership message and checks that it is the wallet on the claim that signs. The server checks the
 * signature again; this only spares the person a round trip when they have the wrong account selected.
 * @param wallet - The connected wallet.
 * @param input - What to sign.
 * @param input.chain - The claim's chain, which decides whether the address is compared in any letter case.
 * @param input.address - The wallet address on the claim.
 * @param input.message - The exact text to sign.
 * @returns The signature, or why there is none.
 */
export async function signOwnership(
  wallet: WalletSigner,
  input: { chain: ChainId; address: string; message: string },
): Promise<SignOutcome> {
  const lower = chainFamily(input.chain) === 'evm';
  const same = (a: string, b: string) => (lower ? a.toLowerCase() === b.toLowerCase() : a === b);

  // A wallet can throw for many reasons, and none of them may break the page: each is reported as the person's next step.
  try {
    const accounts = await wallet.connect();
    const address = accounts.find((account) => same(account, input.address));

    if (!address) {
      return { ok: false, reason: 'wrong_wallet' };
    }

    return { ok: true, signature: await wallet.sign(address, input.message) };
  } catch (error) {
    return { ok: false, reason: isRejection(error) ? 'rejected' : 'failed' };
  }
}

/**
 * Tells whether a wallet in the browser can sign for this chain with one click: Ethereum-style wallets, Phantom for Solana and
 * TronLink for Tron. Every other chain signs by hand, in the wallet app.
 * @param chain - The chain.
 * @returns True when the "sign with my wallet" button can work.
 */
export function canSignInBrowser(chain: ChainId) {
  return ['evm', 'solana', 'tron'].includes(chainFamily(chain));
}

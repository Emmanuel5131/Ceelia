/** The first topic of an ERC-20 `Transfer(address,address,uint256)` log. */
export const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

/**
 * Turns an amount in a token's smallest unit into the amount people read, such as 1500000 with 6 decimals into 1.5. Extra
 * decimals are cut, not rounded, so the shown amount is never more than what was sent.
 * @param value - The amount in the smallest unit.
 * @param decimals - How many decimals the token has.
 * @param maxFraction - The most decimals to show.
 * @returns The amount, with no trailing zeros.
 */
export function formatUnits(value: bigint, decimals: number, maxFraction = 6) {
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = (value % base).toString().padStart(decimals, '0').slice(0, maxFraction);
  const trimmed = fraction.replace(/0+$/u, '');

  if (trimmed) {
    return `${whole}.${trimmed}`;
  }

  // An amount too small to show in the digits we keep is not zero, so it is never shown as zero.
  return whole === 0n && value > 0n ? `<0.${'0'.repeat(maxFraction - 1)}1` : `${whole}`;
}

type TokenTransfer = { contract: string; from: string; to: string; value: bigint };

const addressOfTopic = (topic: string) => `0x${topic.slice(-40)}`.toLowerCase();

/**
 * Reads an ERC-20 transfer out of a transaction log. A log that is not a transfer, or is an NFT transfer (which has a fourth
 * topic), gives null.
 * @param log - The log from the transaction receipt.
 * @param log.address - The contract that emitted it.
 * @param log.topics - The log's topics.
 * @param log.data - The log's data, which holds the amount.
 * @returns The transfer, or null.
 */
export function decodeTransferLog(log: { address: string; topics: string[]; data: string }) {
  const [topic, from, to] = log.topics;

  if (log.topics.length !== 3 || topic !== transferTopic || !from || !to || log.data === '0x') {
    return null;
  }

  return {
    contract: log.address.toLowerCase(),
    from: addressOfTopic(from),
    to: addressOfTopic(to),
    value: BigInt(log.data),
  } satisfies TokenTransfer;
}

function readText(hex: string) {
  const text = (hex.match(/../gu) ?? [])
    .map((pair) => Number.parseInt(pair, 16))
    .filter((code) => code !== 0)
    .map((code) => String.fromCodePoint(code))
    .join('');

  return /^[\u0020-\u007E]{1,16}$/u.test(text) ? text : null;
}

/**
 * Reads a token's symbol from the answer to `symbol()`. Most tokens answer with an ABI-encoded string; a few older ones answer
 * with 32 raw bytes.
 * @param hex - The answer, as hex.
 * @returns The symbol, or null when it cannot be read.
 */
export function decodeSymbol(hex: string) {
  const bytes = hex.replace(/^0x/u, '');

  if (bytes.length === 64) {
    return readText(bytes);
  }

  // An ABI string is an offset (32 bytes), a length (32 bytes), then the text.
  const length = Number.parseInt(bytes.slice(64, 128), 16);

  return bytes.length >= 128 && length > 0 && length <= 32
    ? readText(bytes.slice(128, 128 + length * 2))
    : null;
}

/**
 * Tells whether the address that sent a transaction is the wallet the person entered. Addresses are compared without regard to
 * case, because the same EVM address is written in mixed case when checksummed.
 * @param from - The sender the chain shows.
 * @param wallet - The wallet in the claim.
 * @returns True when they are the same address.
 */
export function sentFromWallet(from: string, wallet: string) {
  return from.trim().toLowerCase() === wallet.trim().toLowerCase();
}

/** What the chain shows about one transaction. It is read from a public node, never typed in. */
export type TxFacts = {
  state: 'success' | 'failed' | 'pending';
  from: string;
  to: string | null;
  /** The chain's own coin moved by the transaction, when any. */
  native: { amount: string; symbol: string } | null;
  /** The token transfers in the transaction, up to the first few. */
  tokens: { contract: string; from: string; to: string; amount: string; symbol: string | null }[];
  /** When it was confirmed, as an ISO time, or null while it is pending. */
  at: string | null;
};

/** The answer to "what does the chain show for this transaction": found, not found, or we could not tell. */
export type TxLookup =
  | { status: 'found'; facts: TxFacts }
  | { status: 'not_found' }
  | { status: 'unavailable' }
  | { status: 'unsupported' };

/** How a wallet appears in a transaction: it sent it, it received something in it, or it is not in it. */
export type WalletRole = 'sender' | 'recipient' | 'none';

/**
 * Works out how the wallet in a claim appears in a transaction the chain shows.
 * @param facts - What the chain shows.
 * @param wallet - The wallet in the claim, or an empty string when there is none.
 * @returns `sender` when it sent it, `recipient` when it received coins or tokens in it, otherwise `none`.
 */
export function walletRole(facts: TxFacts, wallet: string): WalletRole {
  if (sentFromWallet(facts.from, wallet)) {
    return 'sender';
  }

  const received =
    (facts.to !== null && sentFromWallet(facts.to, wallet)) ||
    facts.tokens.some((token) => sentFromWallet(token.to, wallet));

  return received ? 'recipient' : 'none';
}

/** What the chain showed when a claim's transaction was checked, kept with the claim so a lawyer can read it later. */
export type StoredCheck = {
  /** When the chain was asked, as an ISO time. */
  checkedAt: string;
  /** `found` with the facts, or `not_found` when the chain showed nothing for that ID. */
  status: 'found' | 'not_found';
  facts: TxFacts | null;
  /** How the claim's wallet appears in it, or null when the claim has no wallet. */
  role: WalletRole | null;
};

/**
 * Turns the answer of a lookup into what is kept with the claim. A lookup that could not be made (the node was down, or the chain
 * is not covered) keeps nothing, because "we could not look" is not a finding about the transaction.
 * @param lookup - What the lookup found.
 * @param wallet - The wallet in the claim, or an empty string when there is none.
 * @param now - The time of the check.
 * @returns What to keep, or null.
 */
export function toStoredCheck(lookup: TxLookup, wallet: string, now: Date): StoredCheck | null {
  if (lookup.status === 'found') {
    return {
      checkedAt: now.toISOString(),
      status: 'found',
      facts: lookup.facts,
      role: wallet ? walletRole(lookup.facts, wallet) : null,
    };
  }

  return lookup.status === 'not_found'
    ? { checkedAt: now.toISOString(), status: 'not_found', facts: null, role: null }
    : null;
}

/**
 * The amounts a transaction moved, as short lines: the chain's own coin first, then each token. A token whose symbol could not be
 * read is named by the start of its contract.
 * @param facts - What the chain shows.
 * @returns One line per amount, such as `12400 USDT`.
 */
export function describeAmounts(facts: TxFacts) {
  return [
    ...(facts.native ? [`${facts.native.amount} ${facts.native.symbol}`] : []),
    ...facts.tokens.map(
      (token) => `${token.amount} ${token.symbol ?? token.contract.slice(0, 10)}`,
    ),
  ];
}

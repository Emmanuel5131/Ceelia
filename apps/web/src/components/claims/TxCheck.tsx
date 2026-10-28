'use client';

import { chainIds } from '@celia/core';
import type { ChainId } from '@celia/core';
import { useFormatter, useTranslations } from 'next-intl';
import * as React from 'react';
import { checkTransaction } from '@/app/[locale]/(auth)/dashboard/claims/transaction-actions';
import type { TxCheckResult } from '@/app/[locale]/(auth)/dashboard/claims/transaction-actions';
import { shortReference } from '@/components/claims/claim-row';
import { ExplorerLink } from '@/components/claims/ExplorerLink';
import { Button } from '@/components/ui/button';
import type { TxFacts, WalletRole } from '@/utils/claims/Transaction';

/**
 * Reads a text field of the form; a missing or non-text entry reads as empty.
 * @param data - The form's data.
 * @param name - The field name.
 * @returns The text.
 */
function textOf(data: FormData, name: string) {
  const value = data.get(name);

  return typeof value === 'string' ? value : '';
}

function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[6rem_1fr]">
      <dt className="text-ink-muted">{props.label}</dt>
      <dd className="break-all">{props.children}</dd>
    </div>
  );
}

/**
 * The amounts a transaction moved: the chain's own coin and each token, as the chain shows them.
 * @param props - The amounts props.
 * @param props.facts - What the chain shows.
 * @returns The amounts, one per line.
 */
function Amounts(props: { facts: TxFacts }) {
  const { facts } = props;
  const lines = [
    ...(facts.native ? [`${facts.native.amount} ${facts.native.symbol}`] : []),
    ...facts.tokens.map(
      (token) =>
        `${token.amount} ${token.symbol ?? shortReference(token.contract)} → ${shortReference(token.to)}`,
    ),
  ];

  return (
    <>
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </>
  );
}

/**
 * What the wallet in the claim did in the transaction, said against what the person expected: the transaction that lost the
 * money should have come from their wallet, and the one that funded it should have gone to it.
 * @param props - The message props.
 * @param props.role - How the wallet appears in the transaction.
 * @param props.expect - Which role the person's wallet should have in this transaction.
 * @returns A line, or nothing when there was no wallet to compare.
 */
function RoleMessage(props: { role: WalletRole | null; expect: 'sender' | 'recipient' }) {
  const t = useTranslations('TxCheck');

  if (props.role === null) {
    return null;
  }

  const matches = props.role === props.expect;
  const key = `${props.expect}_${matches ? 'ok' : 'other'}` as const;

  return <p className={matches ? 'font-medium' : 'text-ink-muted'}>{t(key)}</p>;
}

function Found(props: {
  facts: TxFacts;
  result: TxCheckResult;
  chain: ChainId;
  hash: string;
  expect: 'sender' | 'recipient';
}) {
  const t = useTranslations('TxCheck');
  const format = useFormatter();
  const { facts } = props;

  return (
    <div className="grid gap-3">
      <p className="font-medium">{t('found')}</p>
      <dl className="grid gap-2">
        <Row label={t('from')}>
          <span className="font-mono">{facts.from}</span>
        </Row>
        {facts.to && (
          <Row label={t('to')}>
            <span className="font-mono">{facts.to}</span>
          </Row>
        )}
        <Row label={t('amount')}>
          <Amounts facts={facts} />
        </Row>
        <Row label={t('status')}>{t(`state_${facts.state}`)}</Row>
        {facts.at && (
          <Row label={t('date')}>
            {format.dateTime(new Date(facts.at), { dateStyle: 'medium', timeStyle: 'short' })}
          </Row>
        )}
      </dl>
      <RoleMessage role={props.result.role} expect={props.expect} />
      <ExplorerLink chain={props.chain} kind="tx" value={props.hash} />
    </div>
  );
}

/**
 * The "Check on the chain" button for a transaction hash and what it shows: who sent what to whom, how much and when, read from
 * the chain, and whether the wallet in the claim is the one that sent (or received) it. It reads the chain and the wallet from
 * the form it sits in, so a person can see "this is the transfer I mean" before saving.
 * @param props - The check props.
 * @param props.field - The name of the form field that holds the hash.
 * @param props.expect - Whether the claim's wallet should have sent the transaction or received it.
 * @returns The button and the result.
 */
export function TxCheck(props: {
  field: 'txHash' | 'fundingTxHash';
  expect: 'sender' | 'recipient';
}) {
  const t = useTranslations('TxCheck');
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState<{
    result: TxCheckResult;
    chain: ChainId;
    hash: string;
  }>();
  const [pending, startTransition] = React.useTransition();

  const check = () => {
    const form = ref.current?.closest('form');

    if (!form) {
      return;
    }

    const data = new FormData(form);
    const chainValue = textOf(data, 'chain');
    const chain = chainIds.find((id) => id === chainValue);
    const hash = textOf(data, props.field).trim();

    startTransition(async () => {
      if (!chain) {
        return;
      }

      const result = await checkTransaction({
        chain,
        hash,
        wallet: textOf(data, 'walletAddress'),
      });
      setShown({ result, chain, hash });
    });
  };

  return (
    <div ref={ref} className="grid gap-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-self-start"
        disabled={pending}
        onClick={check}
      >
        {pending ? t('checking') : t('check')}
      </Button>
      {shown && !pending && (
        <div className="grid gap-2 border border-border bg-surface p-4 text-sm" aria-live="polite">
          {shown.result.lookup.status === 'found' ? (
            <Found
              facts={shown.result.lookup.facts}
              result={shown.result}
              chain={shown.chain}
              hash={shown.hash}
              expect={props.expect}
            />
          ) : (
            <>
              <p>{t(shown.result.lookup.status)}</p>
              <ExplorerLink chain={shown.chain} kind="tx" value={shown.hash} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

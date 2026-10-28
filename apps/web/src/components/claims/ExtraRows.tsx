'use client';

import type { ChainId } from '@celia/core';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import * as React from 'react';
import { ChainSelect } from '@/components/claims/ChainSelect';
import { FieldMessage } from '@/components/claims/FieldMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * A list the person can grow: extra wallets or transactions, each with its own chain, so one claim can cover addresses on several
 * chains. Each row sends `<name>Chain` and `<name>Value`; an empty row is ignored by the server.
 * @param props - The list props.
 * @param props.name - The field name prefix.
 * @param props.title - The list's heading.
 * @param props.hint - A line saying what to add.
 * @param props.add - The label of the add button.
 * @param props.remove - The label of a row's remove button.
 * @param props.error - The message to show when the server refused the list, or nothing.
 * @param props.defaults - The rows saved so far, when a claim is being edited.
 * @returns The list.
 */
export function ExtraRows(props: {
  name: 'moreAffected' | 'moreReceiving' | 'moreTransactions';
  title: string;
  hint: string;
  add: string;
  remove: string;
  error?: string;
  defaults?: { chain: ChainId; value: string }[];
}) {
  const initial = (props.defaults ?? []).map((row, key) => ({ key, ...row }));
  const next = React.useRef(initial.length);
  const [rows, setRows] =
    React.useState<{ key: number; chain?: ChainId; value: string }[]>(initial);

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 text-sm font-medium">{props.title}</legend>
      <p className="text-sm text-ink-muted">{props.hint}</p>
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid gap-2 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-end"
        >
          <ChainSelect
            id={`${props.name}-chain-${row.key}`}
            name={`${props.name}Chain`}
            defaultValue={row.chain}
          />
          <div className="grid gap-2">
            <Label htmlFor={`${props.name}-value-${row.key}`} className="sr-only">
              {props.title}
            </Label>
            <Input
              id={`${props.name}-value-${row.key}`}
              name={`${props.name}Value`}
              defaultValue={row.value}
              className="font-mono"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(props.error)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={props.remove}
            onClick={() => {
              setRows(rows.filter((other) => other.key !== row.key));
            }}
          >
            <TrashIcon aria-hidden="true" />
          </Button>
        </div>
      ))}
      <FieldMessage show={Boolean(props.error)}>{props.error}</FieldMessage>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() => {
          setRows([...rows, { key: next.current, value: '' }]);
          next.current += 1;
        }}
      >
        <PlusIcon aria-hidden="true" />
        {props.add}
      </Button>
    </fieldset>
  );
}

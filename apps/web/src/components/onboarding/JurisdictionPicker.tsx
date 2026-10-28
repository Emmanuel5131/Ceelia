'use client';

import { getJurisdiction, searchJurisdictions } from '@celia/jurisdictions';
import * as React from 'react';
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { jurisdictionName } from '@/utils/cases/JurisdictionName';

/**
 * A labelled search box for one jurisdiction, for use inside a form. What the person types is only for finding it: the form
 * receives the chosen jurisdiction's id under `name`, and nothing when they typed without choosing.
 * @param props - The picker props.
 * @param props.name - The form field that receives the chosen jurisdiction id.
 * @param props.label - The visible label.
 * @param props.placeholder - The hint inside the empty box.
 * @param props.kind - Limit the search to `country` or `subdivision`; by default both.
 * @param props.defaultId - A jurisdiction id to start with, when editing what the person chose before.
 * @param props.invalid - Marks the box as having an error.
 * @returns The picker.
 */
export function JurisdictionPicker(props: {
  name: string;
  label: string;
  placeholder: string;
  kind?: 'country' | 'subdivision';
  defaultId?: string;
  invalid?: boolean;
}) {
  const id = React.useId();
  const initial = props.defaultId ? getJurisdiction(props.defaultId) : undefined;
  const [query, setQuery] = React.useState(initial ? jurisdictionName(initial) : '');
  const [selected, setSelected] = React.useState(initial?.id ?? '');
  const [open, setOpen] = React.useState(false);

  const matches = open ? searchJurisdictions(query, { kind: props.kind }) : [];

  return (
    <div className="grid gap-2">
      <Label htmlFor={`${id}-input`}>{props.label}</Label>
      <input type="hidden" name={props.name} value={selected} />
      <Command shouldFilter={false} label={props.label}>
        <CommandInput
          id={`${id}-input`}
          className="h-(--control-md) text-base"
          placeholder={props.placeholder}
          aria-invalid={props.invalid}
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            setSelected('');
            setOpen(value.length > 0);
          }}
          onBlur={() => {
            setOpen(false);
          }}
          autoComplete="off"
          spellCheck={false}
        />
        {matches.length > 0 && (
          <CommandList aria-label={props.label}>
            {matches.map((j) => (
              <CommandItem
                key={j.id}
                value={j.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onSelect={() => {
                  setSelected(j.id);
                  setQuery(jurisdictionName(j));
                  setOpen(false);
                }}
              >
                <span className="font-medium">{j.name}</span>
                {j.parent && <span className="text-sm text-ink-muted">{j.parent.name}</span>}
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>
    </div>
  );
}

'use client';

import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react';
import * as React from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/Cn';
import { fieldStyles } from './field-styles';

export type ComboboxItem = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  /** Items with the same group are listed together under its heading, in order of first appearance. */
  group?: string;
  /** Extra words the search also matches, such as other names or abbreviations. */
  keywords?: string[];
};

/**
 * A select with a search box, for long lists. It looks like the other fields and sends its value in a form under `name`.
 * @param props - The combobox props.
 * @param props.id - The id for the trigger, so a label can point at it.
 * @param props.name - The form field that receives the chosen value.
 * @param props.items - The choices.
 * @param props.value - The chosen value.
 * @param props.onValueChange - Called when the person picks one.
 * @param props.searchPlaceholder - The hint in the search box.
 * @param props.emptyText - Shown when the search finds nothing.
 * @returns The combobox.
 */
export function Combobox(props: {
  id?: string;
  name?: string;
  items: ComboboxItem[];
  value: string;
  onValueChange: (value: string) => void;
  searchPlaceholder: string;
  emptyText: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = props.items.find((item) => item.value === props.value);
  const groups = [...new Set(props.items.map((item) => item.group ?? ''))];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {props.name && <input type="hidden" name={props.name} value={props.value} />}
      <PopoverTrigger asChild>
        <button
          id={props.id}
          type="button"
          // A button with the combobox role is the standard pattern for a select with search, and what Radix Select does.
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
          role="combobox"
          aria-expanded={open}
          aria-controls={`${props.id}-list`}
          className={cn(
            fieldStyles,
            'flex h-(--control-md) items-center justify-between gap-3 py-2 pr-3 text-left',
          )}
        >
          <span className="flex min-w-0 items-center gap-3">
            {selected?.icon}
            <span className="truncate">{selected?.label}</span>
          </span>
          <CaretDownIcon className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width)">
        <Command>
          <CommandInput
            className="h-(--control-md) border-0 border-b text-base focus-visible:outline-none"
            placeholder={props.searchPlaceholder}
            autoComplete="off"
          />
          <CommandList
            id={`${props.id}-list`}
            className="static mt-0 max-h-72 border-0 shadow-none"
          >
            <CommandEmpty>{props.emptyText}</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group} heading={group || undefined}>
                {props.items
                  .filter((item) => (item.group ?? '') === group)
                  .map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      keywords={[item.label, ...(item.keywords ?? [])]}
                      className="items-center gap-3 px-4 py-2"
                      onSelect={() => {
                        props.onValueChange(item.value);
                        setOpen(false);
                      }}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      {item.value === props.value && (
                        <CheckIcon className="size-4" aria-hidden="true" />
                      )}
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

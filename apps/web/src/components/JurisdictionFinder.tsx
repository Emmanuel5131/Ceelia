'use client';

import { searchJurisdictions } from '@celia/jurisdictions';
import type { Jurisdiction } from '@celia/jurisdictions';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { JurisdictionCard } from '@/components/JurisdictionCard';
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';

const examples = ['Nigeria', 'New York', 'United Kingdom', 'India'];

/**
 * A search box for every country, state, province and region. Choosing one shows which kind of rule applies there.
 * @param props - The finder props.
 * @param props.onSelect - Called when someone picks a jurisdiction, so a form can use the choice.
 * @returns The search box, its suggestions and the answer.
 */
export function JurisdictionFinder(props: { onSelect?: (jurisdiction: Jurisdiction) => void }) {
  const t = useTranslations('Jurisdictions');
  const id = React.useId();
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Jurisdiction | null>(null);

  const matches = open ? searchJurisdictions(query) : [];

  const choose = (j: Jurisdiction) => {
    setSelected(j);
    setQuery(j.parent ? `${j.name}, ${j.parent.name}` : j.name);
    setOpen(false);
    props.onSelect?.(j);
  };

  return (
    <div className="grid max-w-3xl gap-6">
      <div className="grid gap-2">
        <Label htmlFor={`${id}-input`}>{t('search_label')}</Label>
        {/* cmdk handles the combobox roles, keyboard keys and focus; we filter ourselves so codes and abbreviations match. */}
        <Command shouldFilter={false} label={t('search_label')}>
          <CommandInput
            id={`${id}-input`}
            placeholder={t('search_placeholder')}
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setOpen(value.length > 0);
            }}
            onBlur={() => {
              setOpen(false);
            }}
            autoComplete="off"
            spellCheck={false}
          />
          {matches.length > 0 && (
            <CommandList aria-label={t('results_label')}>
              {matches.map((j) => (
                <CommandItem
                  key={j.id}
                  value={j.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onSelect={() => {
                    choose(j);
                  }}
                >
                  <span className="font-medium">{j.name}</span>
                  {j.parent && <span className="text-sm text-ink-muted">{j.parent.name}</span>}
                </CommandItem>
              ))}
            </CommandList>
          )}
        </Command>
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          {t('try_label')}:
          {examples.map((name) => (
            <button
              key={name}
              type="button"
              className="border border-border px-3 py-1 text-ink focus-ring transition-colors hover:bg-ink hover:text-on-ink"
              onClick={() => {
                const [first] = searchJurisdictions(name, { limit: 1 });

                if (first) {
                  choose(first);
                }
              }}
            >
              {name}
            </button>
          ))}
        </p>
      </div>

      <div aria-live="polite">{selected && <JurisdictionCard jurisdiction={selected} />}</div>
      <p className="text-sm text-ink-muted">{t('disclaimer')}</p>
    </div>
  );
}

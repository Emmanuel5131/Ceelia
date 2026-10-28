'use client';

import { searchJurisdictions } from '@celia/jurisdictions';
import type { Jurisdiction } from '@celia/jurisdictions';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { JurisdictionCard, useRuleKinds } from '@/components/jurisdictions/JurisdictionCard';
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/Cn';

const examples = ['United States', 'United Kingdom', 'India', 'Singapore', 'United Arab Emirates'];
const kindOrder = ['certificate', 'authentication', 'presumption', 'equal'] as const;

/**
 * A search box for every country, state, province and region. Choosing one shows which kind of rule applies there.
 * @param props - The finder props.
 * @param props.onSelect - Called when someone picks a jurisdiction, so a form can use the choice.
 * @returns The search box, its suggestions and the answer.
 */
export function JurisdictionFinder(props: { onSelect?: (jurisdiction: Jurisdiction) => void }) {
  const t = useTranslations('Jurisdictions');
  const kinds = useRuleKinds();
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
    <div className="grid gap-6">
      <div className="grid max-w-3xl gap-2">
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

      <section className="grid gap-4" aria-labelledby={`${id}-kinds`}>
        <h2
          id={`${id}-kinds`}
          className="font-body text-sm font-medium tracking-wider text-ink-muted uppercase"
        >
          {t('kinds_title')}
        </h2>
        <dl className="grid border-t border-border md:grid-cols-4">
          {kindOrder.map((mode, index) => (
            <div
              key={mode}
              className={cn(
                'grid content-start gap-2 border-b border-line-soft p-4 md:border-b-0 md:border-l md:border-border',
                selected?.mode === mode && 'bg-card',
              )}
            >
              <dt className="flex items-baseline gap-3 font-bold">
                <span className="font-mono text-xs font-normal text-ink-muted">0{index + 1}</span>
                {kinds[mode].title}
              </dt>
              <dd className="text-sm text-ink-muted">{kinds[mode].text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="max-w-3xl text-sm text-ink-muted">{t('disclaimer')}</p>
    </div>
  );
}

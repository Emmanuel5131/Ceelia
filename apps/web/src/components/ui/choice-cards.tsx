'use client';

import * as React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/utils/Cn';

// Whole class names, so Tailwind can see them. A last odd card in the two-column layout spans the row.
const columnClasses = {
  2: 'gap-4 sm:grid-cols-2 sm:[&>label:last-child:nth-child(odd)]:col-span-2',
  4: 'gap-3 sm:grid-cols-2 lg:grid-cols-4',
} as const;

export type ChoiceOption<Value extends string> = {
  value: Value;
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

/**
 * One answer as a card: a title and a line of explanation, with the control that picks it. Every card has a fill, and the chosen
 * one is filled with ink, so it can never be mistaken for one that is only hovered. Four to a row means compact stacked cards:
 * icon and control on top, then the title and what it means.
 * @param props - The face props.
 * @param props.option - The answer.
 * @param props.checked - Whether it is chosen.
 * @param props.stacked - Whether to use the compact stacked layout.
 * @param props.control - The radio or checkbox that picks it.
 * @returns The card.
 */
function ChoiceCardFace<Value extends string>(props: {
  option: ChoiceOption<Value>;
  checked: boolean;
  stacked: boolean;
  control: React.ReactNode;
}) {
  const { option, checked, stacked } = props;

  return (
    <Card
      variant="outline"
      className={cn(
        'relative h-full transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
        // The card sets its fill and border with a variant selector, so these use the same one to take over.
        checked
          ? 'text-on-ink data-[variant=outline]:border-ink data-[variant=outline]:bg-ink data-[variant=outline]:hover:bg-ink-hover'
          : 'data-[variant=outline]:bg-paper data-[variant=outline]:hover:bg-paper-sunken',
        stacked ? 'gap-2 p-3' : 'flex-row items-start gap-3 px-4 py-4',
      )}
    >
      {stacked ? (
        <div className="flex items-center justify-between px-0">
          {option.icon}
          {props.control}
        </div>
      ) : (
        props.control
      )}
      <CardHeader className="min-w-0 flex-1 content-start gap-1 px-0">
        <CardTitle
          className={cn(
            'flex items-center gap-3 font-sans',
            stacked ? 'text-base font-bold' : 'text-base font-medium',
          )}
        >
          {!stacked && option.icon}
          {option.title}
        </CardTitle>
        {option.description && (
          <CardDescription
            className={cn(
              stacked && 'min-h-[2lh] text-sm font-medium',
              checked && 'text-on-ink-muted',
            )}
          >
            {option.description}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}

/**
 * A question with a few big answers, each a card with a title and a line of explanation. One is chosen. It sends the choice in
 * a form under `name`. Two sit side by side from the small breakpoint up, or four from large.
 * @param props - The choice props.
 * @param props.name - The form field that receives the chosen value.
 * @param props.label - What the question is, for screen readers.
 * @param props.options - The answers.
 * @param props.value - The chosen value, if any.
 * @param props.onChange - Called when the person picks one.
 * @param props.columns - How many cards sit side by side on a wide screen: two by default.
 * @returns The cards.
 */
export function ChoiceCards<Value extends string>(props: {
  name: string;
  label: string;
  options: readonly ChoiceOption<Value>[];
  value: Value | undefined;
  onChange: (value: Value) => void;
  columns?: 2 | 4;
}) {
  const id = React.useId();
  const stacked = props.columns === 4;

  return (
    <RadioGroup
      name={props.name}
      aria-label={props.label}
      value={props.value ?? ''}
      onValueChange={(next) => {
        const option = props.options.find((o) => o.value === next);

        if (option) {
          props.onChange(option.value);
        }
      }}
      className={columnClasses[props.columns ?? 2]}
    >
      {props.options.map((option) => (
        <label key={option.value} htmlFor={`${id}-${option.value}`} className="cursor-pointer">
          <ChoiceCardFace
            option={option}
            checked={props.value === option.value}
            stacked={stacked}
            control={
              <RadioGroupItem
                id={`${id}-${option.value}`}
                value={option.value}
                className={cn(stacked ? undefined : 'mt-1', 'data-checked:border-on-ink')}
              />
            }
          />
        </label>
      ))}
    </RadioGroup>
  );
}

/**
 * The same cards when more than one answer can be chosen: tap a card to choose it or tap again to clear it, and every chosen
 * value is sent in the form under `name`. There is no visible box: the filled card is the choice.
 * @param props - The choice props.
 * @param props.name - The form field that receives each chosen value.
 * @param props.label - What the question is, for screen readers.
 * @param props.options - The answers.
 * @param props.value - The chosen values.
 * @param props.onChange - Called with the new set of chosen values.
 * @param props.columns - How many cards sit side by side on a wide screen: two by default.
 * @returns The cards.
 */
export function MultiChoiceCards<Value extends string>(props: {
  name: string;
  label: string;
  options: readonly ChoiceOption<Value>[];
  value: readonly Value[];
  onChange: (value: Value[]) => void;
  columns?: 2 | 4;
}) {
  const id = React.useId();
  const stacked = props.columns === 4;

  return (
    <fieldset className={cn('grid w-full min-w-0', columnClasses[props.columns ?? 2])}>
      <legend className="sr-only">{props.label}</legend>
      {props.options.map((option) => {
        const checked = props.value.includes(option.value);

        return (
          <label key={option.value} htmlFor={`${id}-${option.value}`} className="cursor-pointer">
            <ChoiceCardFace
              option={option}
              checked={checked}
              stacked={stacked}
              control={
                <Checkbox
                  id={`${id}-${option.value}`}
                  name={props.name}
                  value={option.value}
                  checked={checked}
                  onCheckedChange={(next) => {
                    props.onChange(
                      next === true
                        ? [...props.value, option.value]
                        : props.value.filter((value) => value !== option.value),
                    );
                  }}
                  // The whole card is the tap target and the fill shows the choice, so the box itself is hidden from view but
                  // stays in the page for the keyboard and screen readers.
                  className="sr-only"
                />
              }
            />
          </label>
        );
      })}
    </fieldset>
  );
}

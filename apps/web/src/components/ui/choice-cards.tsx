'use client';

import * as React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type ChoiceOption<Value extends string> = {
  value: Value;
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

/**
 * A question with a few big answers, each a card with a title and a line of explanation. One is chosen. It sends the choice in
 * a form under `name`.
 * @param props - The choice props.
 * @param props.name - The form field that receives the chosen value.
 * @param props.label - What the question is, for screen readers.
 * @param props.options - The answers.
 * @param props.value - The chosen value, if any.
 * @param props.onChange - Called when the person picks one.
 * @returns The cards.
 */
export function ChoiceCards<Value extends string>(props: {
  name: string;
  label: string;
  options: readonly ChoiceOption<Value>[];
  value: Value | undefined;
  onChange: (value: Value) => void;
}) {
  const id = React.useId();

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
      className="gap-4"
    >
      {props.options.map((option) => (
        <label key={option.value} htmlFor={`${id}-${option.value}`} className="cursor-pointer">
          <Card
            variant="outline"
            className="flex-row items-start gap-4 px-6 py-5 transition-colors hover:bg-paper has-data-[state=checked]:border-ink"
          >
            <RadioGroupItem id={`${id}-${option.value}`} value={option.value} className="mt-1" />
            <CardHeader className="min-w-0 flex-1 gap-1 px-0">
              <CardTitle className="flex items-center gap-3 font-sans text-base font-medium">
                {option.icon}
                {option.title}
              </CardTitle>
              {option.description && <CardDescription>{option.description}</CardDescription>}
            </CardHeader>
          </Card>
        </label>
      ))}
    </RadioGroup>
  );
}

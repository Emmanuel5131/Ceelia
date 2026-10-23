import * as React from 'react';
import { cn } from '@/utils/Cn';
import { fieldStyles } from './field-styles';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldStyles,
        'h-(--control-md) py-1 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink',
        className,
      )}
      {...props}
    />
  );
}

export { Input };

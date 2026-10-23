import * as React from 'react';
import { cn } from '@/utils/Cn';
import { fieldStyles } from './field-styles';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldStyles, 'flex field-sizing-content min-h-24 py-2.5', className)}
      {...props}
    />
  );
}

export { Textarea };

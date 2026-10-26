import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';
import { cn } from '@/utils/Cn';

/**
 * A tag: rectangular, 24px tall, hairline border (docs/DESIGN.md §6). State is shown by shape as well as colour,
 * so a status badge always carries a text label. `seal` is for findings and verdicts only.
 */
const badgeVariants = cva(
  'group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border px-2 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-ring has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3.5',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-ink [a]:hover:bg-paper',
        solid: 'border-ink bg-ink text-on-ink',
        muted: 'border-transparent bg-paper text-ink-muted',
        seal: 'border-seal bg-surface text-seal',
        dashed: 'border-dashed border-ink bg-surface text-ink',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

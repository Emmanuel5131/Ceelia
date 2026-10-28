import * as React from 'react';
import { cn } from '@/utils/Cn';

/**
 * Cards come in two looks (docs/DESIGN.md §6): `default` is a paper surface for grouped content, `outline` is white with a
 * hairline border, for content that must stand out from a paper page area or hold a table.
 * @param props - The card props.
 * @param props.className - Extra classes for the card.
 * @param props.size - `default` or the tighter `sm`.
 * @param props.variant - `default` (paper) or `outline` (white with a hairline).
 * @returns The card.
 */
function Card({
  className,
  size = 'default',
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm'; variant?: 'default' | 'outline' }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        'data-[variant=outline]:border data-[variant=outline]:border-border data-[variant=outline]:bg-surface',
        'group/card flex flex-col gap-(--card-spacing) overflow-hidden bg-card py-(--card-spacing) text-sm text-card-foreground [--card-spacing:--spacing(6)] md:[--card-spacing:--spacing(8)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] md:data-[size=sm]:[--card-spacing:--spacing(4)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'font-heading text-xl font-normal group-data-[size=sm]/card:text-base',
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-content" className={cn('px-(--card-spacing)', className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A headline number: Aeonik with tabular figures, so a row of stat cards lines up (docs/DESIGN.md §3).
 * @param props - The paragraph props.
 * @param props.className - Extra classes for the number.
 * @returns The number.
 */
function CardValue({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-value"
      className={cn(
        'font-heading text-4xl leading-none tabular-nums group-data-[size=sm]/card:text-2xl',
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardValue,
};

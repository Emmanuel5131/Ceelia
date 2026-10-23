'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';
import { cn } from '@/utils/Cn';

// Underlined tabs: a hairline under the list and a 2px ink bar under the active tab (docs/DESIGN.md §6).
function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('flex gap-4 data-[orientation=horizontal]:flex-col', className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('flex items-center gap-6 border-b border-border', className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-(--control-md) items-center gap-2 text-base font-medium whitespace-nowrap text-ink-muted outline-none transition-colors duration-150 hover:text-ink focus-ring disabled:pointer-events-none disabled:opacity-40 data-[state=active]:text-ink [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-ink after:opacity-0 data-[state=active]:after:opacity-100',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 text-base outline-none focus-ring', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

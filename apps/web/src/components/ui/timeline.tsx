import * as React from 'react';
import { cn } from '@/utils/Cn';

/**
 * An ordered list of events or steps. Items bring their own marker.
 * @param props - The list props.
 * @param props.className - Extra classes for the list.
 * @returns The list.
 */
function Timeline({ className, ...props }: React.ComponentProps<'ol'>) {
  return <ol data-slot="timeline" className={cn('grid', className)} {...props} />;
}

type TimelineMarker = 'filled' | 'dashed' | 'hollow' | 'muted';

/**
 * One event or step with a square marker. The marker carries the state by shape, never by colour alone (docs/DESIGN.md §6):
 * `filled` = done or sealed, `dashed` = the step you are on, `hollow` = an event, `muted` = not yet.
 * @param props - The item props.
 * @param props.className - Extra classes for the item.
 * @param props.marker - The marker shape, `hollow` by default.
 * @param props.icon - An icon to show in the marker instead of the plain square. The marker's shape still carries the state.
 * @param props.children - The item content.
 * @returns The list item.
 */
function TimelineItem({
  className,
  marker = 'hollow',
  children,
  icon,
  ...props
}: React.ComponentProps<'li'> & { marker?: TimelineMarker; icon?: React.ReactNode }) {
  return (
    <li
      data-slot="timeline-item"
      data-marker={marker}
      className={cn(
        'flex gap-4 border-t border-line-soft py-4 first:border-t-0 first:pt-0 last:pb-0',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'shrink-0',
          icon ? 'flex size-8 items-center justify-center [&>svg]:size-4' : 'mt-1.5 size-2.5',
          marker === 'filled' && (icon ? 'bg-ink text-on-ink' : 'bg-ink'),
          marker === 'hollow' && 'border-[1.5px] border-ink',
          marker === 'dashed' && 'border-[1.5px] border-dashed border-ink',
          marker === 'muted' && 'border-[1.5px] border-ink-soft',
        )}
      >
        {icon}
      </span>
      <div className="grid min-w-0 gap-1">{children}</div>
    </li>
  );
}

export { Timeline, TimelineItem };

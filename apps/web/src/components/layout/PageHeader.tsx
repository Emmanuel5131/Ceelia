import { cn } from '@/utils/Cn';

/**
 * The title row of every app page: title on the left, the page's one primary action on the right. Below it sits 32px of space.
 * @param props - The header props.
 * @param props.title - The page title (Aeonik 32).
 * @param props.description - One optional sentence under the title, or a short line of details.
 * @param props.actions - The page's actions; at most one primary button.
 * @param props.centered - Centre the title and description, for a focused page such as a form.
 * @param props.compact - A smaller title and tighter spacing, for a form that has to fit on one screen.
 * @returns The page header.
 */
export function PageHeader(props: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  centered?: boolean;
  compact?: boolean;
}) {
  return (
    <header
      className={cn(
        'mb-8 flex flex-wrap items-end justify-between gap-4',
        props.centered && 'mb-4 justify-center text-center',
        props.compact && 'mb-2',
      )}
    >
      <div className="grid gap-2">
        <h1 className={props.compact ? 'text-2xl' : 'text-3xl'}>{props.title}</h1>
        {props.description && (
          <p className={cn('text-ink-muted', props.compact ? 'text-sm' : 'text-base')}>
            {props.description}
          </p>
        )}
      </div>
      {props.actions && <div className="flex items-center gap-4">{props.actions}</div>}
    </header>
  );
}

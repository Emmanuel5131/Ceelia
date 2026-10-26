/**
 * A titled block on a page: heading, one line of description, an optional action on the right, then the content. Every section
 * on every page uses it, so headings and spacing never differ from screen to screen.
 * @param props - The section props.
 * @param props.title - The section heading (Aeonik 20).
 * @param props.description - One optional sentence under the heading.
 * @param props.action - Something to put on the right of the heading, such as a link.
 * @param props.children - The content.
 * @returns The section.
 */
export function PageSection(props: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] content-start gap-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div className="grid gap-1">
          <h2 className="text-xl">{props.title}</h2>
          {props.description && <p className="text-sm text-ink-muted">{props.description}</p>}
        </div>
        {props.action}
      </header>
      {props.children}
    </section>
  );
}

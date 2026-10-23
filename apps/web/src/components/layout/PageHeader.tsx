/**
 * The title row of every app page: title on the left, the page's one primary action on the right. Below it sits 32px of space.
 * @param props - The header props.
 * @param props.title - The page title (Aeonik 32).
 * @param props.description - One optional sentence under the title.
 * @param props.actions - The page's actions; at most one primary button.
 * @returns The page header.
 */
export function PageHeader(props: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-2">
        <h1 className="text-3xl">{props.title}</h1>
        {props.description && <p className="text-base text-ink-muted">{props.description}</p>}
      </div>
      {props.actions && <div className="flex items-center gap-4">{props.actions}</div>}
    </header>
  );
}

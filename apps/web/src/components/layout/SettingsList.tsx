import { Card } from '@/components/ui/card';

/**
 * A group of settings: one bordered card with a row per setting, divided by hairlines.
 * @param props - The list props.
 * @param props.children - The `SettingsRow`s.
 * @returns The list.
 */
export function SettingsList(props: { children: React.ReactNode }) {
  return (
    <Card variant="outline" className="gap-0 py-0 md:[--card-spacing:--spacing(6)]">
      {props.children}
    </Card>
  );
}

/**
 * One setting: what it is and what it does on the left, the control on the right. On a phone the control drops under the text.
 * @param props - The row props.
 * @param props.title - The setting's name.
 * @param props.description - One sentence on what it changes.
 * @param props.children - The control: a button, a select or a switch.
 * @returns The row.
 */
export function SettingsRow(props: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line-soft px-6 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="grid gap-1">
        <h2 className="font-sans text-base font-medium">{props.title}</h2>
        <p className="text-sm text-ink-muted">{props.description}</p>
      </div>
      <div className="shrink-0">{props.children}</div>
    </div>
  );
}

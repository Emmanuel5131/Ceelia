import { Card, CardContent, CardDescription, CardHeader, CardValue } from '@/components/ui/card';

/**
 * One headline number with its label and a short hint, composed only from the Card parts so every stat looks the same.
 * @param props - The card props.
 * @param props.label - What is being counted.
 * @param props.value - The number, already formatted.
 * @param props.hint - An optional short line of context under the number.
 * @returns The stat card.
 */
export function StatCard(props: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{props.label}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        <CardValue>{props.value}</CardValue>
        {props.hint && <CardDescription>{props.hint}</CardDescription>}
      </CardContent>
    </Card>
  );
}

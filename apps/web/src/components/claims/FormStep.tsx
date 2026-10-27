import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** How many steps the first page of a claim has. */
export const claimFormSteps = 5;

/**
 * One question of the claim form as a box, with the question centred above its fields. "Step 2 of 4" is for screen readers; the
 * progress bars show it to everyone else.
 * @param props - The step props.
 * @param props.step - Which step this is, from 1.
 * @param props.title - The question.
 * @param props.children - The fields.
 * @returns The step.
 */
export function FormStep(props: { step: number; title: string; children: React.ReactNode }) {
  const t = useTranslations('ClaimPage');

  return (
    <Card variant="outline" size="sm">
      <CardHeader className="justify-items-center text-center">
        <CardDescription className="sr-only">
          {t('step_of', { step: props.step, total: claimFormSteps })}
        </CardDescription>
        <CardTitle>{props.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">{props.children}</CardContent>
    </Card>
  );
}

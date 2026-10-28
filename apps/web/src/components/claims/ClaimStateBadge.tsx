import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { ClaimState } from '@/utils/claims/ClaimState';

const variants = {
  draft: 'dashed',
  sent: 'sent',
  in_review: 'review',
  accepted: 'accepted',
  rejected: 'rejected',
} as const;

/**
 * A claim's state as a tinted tag: blue for sent, amber for in review, green for accepted, red for rejected, dashed for a draft.
 * The label always says it too, so colour never carries the state alone.
 * @param props - The badge props.
 * @param props.state - The claim's state.
 * @returns The tag.
 */
export function ClaimStateBadge(props: { state: ClaimState }) {
  const t = useTranslations('ClaimList');

  return <Badge variant={variants[props.state]}>{t(`state_${props.state}`)}</Badge>;
}

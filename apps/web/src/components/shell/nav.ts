import type { AccountType } from '@/utils/Account';

export type NavId = 'overview' | 'cases' | 'jurisdictions' | 'settings';

export const navHref: Record<NavId, string> = {
  overview: '/dashboard',
  cases: '/dashboard/cases',
  jurisdictions: '/dashboard/jurisdictions',
  settings: '/dashboard/settings',
};

/**
 * The left navigation for each account type. The case bank is public, so both see it; what they see inside differs.
 * Counsel will gain "my cases" and "firm" here.
 */
export const navByAccount: Record<AccountType, NavId[]> = {
  person: ['overview', 'cases', 'jurisdictions', 'settings'],
  counsel: ['overview', 'cases', 'jurisdictions', 'settings'],
};

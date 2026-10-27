import type { AccountType } from '@/utils/Account';

export type NavId = 'overview' | 'claims' | 'cases' | 'jurisdictions' | 'settings' | 'staff';

export const navHref: Record<NavId, string> = {
  overview: '/dashboard',
  claims: '/dashboard/claims',
  cases: '/dashboard/cases',
  jurisdictions: '/dashboard/jurisdictions',
  settings: '/dashboard/settings',
  staff: '/dashboard/staff',
};

/**
 * The left navigation for each account type. The case bank is public, so both see it; what they see inside differs.
 * Only people file claims, so only they get "claims". Counsel will gain "my cases" and "firm" here.
 */
export const navByAccount: Record<AccountType, NavId[]> = {
  person: ['overview', 'claims', 'cases', 'jurisdictions', 'settings'],
  counsel: ['overview', 'cases', 'jurisdictions', 'settings'],
};

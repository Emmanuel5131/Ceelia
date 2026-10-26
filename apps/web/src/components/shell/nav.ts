import type { Role } from '@/utils/Role';

export type NavId = 'overview' | 'cases' | 'jurisdictions' | 'settings';

export const navHref: Record<NavId, string> = {
  overview: '/dashboard',
  cases: '/dashboard/cases',
  jurisdictions: '/dashboard/jurisdictions',
  settings: '/dashboard/user-profile',
};

/** The left navigation for each role. Victims see their own case, so they do not get the case bank list. */
export const navByRole: Record<Role, NavId[]> = {
  victim: ['overview', 'jurisdictions', 'settings'],
  lawyer: ['overview', 'cases', 'jurisdictions', 'settings'],
  researcher: ['overview', 'cases', 'jurisdictions', 'settings'],
  analyst: ['overview', 'cases', 'jurisdictions', 'settings'],
};

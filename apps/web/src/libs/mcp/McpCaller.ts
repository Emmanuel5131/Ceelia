import { auth, clerkClient } from '@clerk/nextjs/server';
import { staffDecision } from '@/libs/accounts/Staff';
import { parseAccount } from '@/utils/accounts/Account';

/**
 * Finds who is calling the MCP routes from the OAuth token the assistant signed in with. Clerk checks the token; the role comes
 * from the person's account, and staff must pass the same rules as the staff area, so the MCP server is never a way round them.
 * Someone who has not finished onboarding has no role, because a missing account never defaults to one.
 * @returns The caller, or null when the token is missing, wrong or belongs to someone with no role.
 */
export async function identifyMcpCaller() {
  const state = await auth({ acceptsToken: 'oauth_token' });

  if (!state.isAuthenticated || !state.userId) {
    return null;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(state.userId);

  if (staffDecision(user) === 'allowed') {
    return { userId: user.id, role: 'staff' as const };
  }

  const account = parseAccount(user.publicMetadata);

  return account ? { userId: user.id, role: account.accountType } : null;
}

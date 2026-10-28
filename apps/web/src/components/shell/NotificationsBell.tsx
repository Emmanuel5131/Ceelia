import { NotificationsMenu } from '@/components/shell/NotificationsMenu';
import { countUnread, listInbox } from '@/libs/notifications/Inbox';

/**
 * The bell in the header, with the signed-in person's latest notifications and how many are unread.
 * @param props - The bell props.
 * @param props.userId - The Clerk user id.
 * @returns The bell.
 */
export async function NotificationsBell(props: { userId: string }) {
  const [items, unread] = await Promise.all([
    listInbox(props.userId, 8),
    countUnread(props.userId),
  ]);

  return <NotificationsMenu items={items} unread={unread} />;
}

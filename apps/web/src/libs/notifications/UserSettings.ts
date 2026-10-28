import { db } from '@/libs/DB';
import { userSettingSchema } from '@/models/Schema';
import { emailLocale } from '@/utils/notifications/NotifyPlan';

/**
 * Remembers the language a person uses, so emails sent later, when there is no page or request, are written in it. A language
 * we have no copy for is ignored.
 * @param userId - The Clerk user id.
 * @param locale - The language.
 */
export async function saveLocale(userId: string, locale: string) {
  await db
    .insert(userSettingSchema)
    .values({ userId, locale: emailLocale(locale) })
    .onConflictDoUpdate({ target: userSettingSchema.userId, set: { locale: emailLocale(locale) } });
}

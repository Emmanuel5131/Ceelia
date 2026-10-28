import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { emailSuppressionSchema } from '@/models/Schema';

/**
 * Stops all mail to an address. Used for hard bounces and spam complaints, which mail providers expect a sender to honour
 * quickly: mailing a dead or complaining address damages the sending reputation of every other message.
 * @param email - The address.
 * @param reason - Why.
 */
export async function suppress(email: string, reason: 'bounce' | 'complaint' | 'manual') {
  await db
    .insert(emailSuppressionSchema)
    .values({ email: email.trim().toLowerCase(), reason })
    .onConflictDoNothing();
}

/**
 * Lets mail to an address again, after staff have checked the problem is fixed.
 * @param email - The address.
 */
export async function unsuppress(email: string) {
  await db
    .delete(emailSuppressionSchema)
    .where(eq(emailSuppressionSchema.email, email.toLowerCase()));
}

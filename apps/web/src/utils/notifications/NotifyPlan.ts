import { shouldEmail } from '@celia/core';
import type { EmailPreferences, NotificationType } from '@celia/core';
import { AppConfig } from '@/utils/AppConfig';

/** One thing that happened to one person. `data` holds ids only: never claim detail. */
export type NotifyEvent = {
  userId: string;
  type: NotificationType;
  /** Makes a repeated action write one notification, as in `claim_submitted:<claim id>`. */
  dedupeKey: string;
  data?: Record<string, string>;
};

export type NotifyPlan = {
  event: NotifyEvent;
  /** Whether this notification also goes by email. */
  email: boolean;
  /** The language the email is written in. */
  locale: string;
};

/**
 * Picks the language for a person's email: the one they saved, if we write in it, otherwise the default.
 * @param saved - The language they saved, if any.
 * @returns A language we have copy for.
 */
export function emailLocale(saved?: string) {
  return saved && AppConfig.i18n.locales.includes(saved) ? saved : AppConfig.i18n.defaultLocale;
}

/**
 * Decides, for each event, whether it also goes by email and in which language. Every event becomes an in-app notification;
 * this only decides about the email.
 * @param events - The events.
 * @param lookup - What is known about the people they are for.
 * @param lookup.preferences - Each person's email choices, by user id.
 * @param lookup.locales - Each person's saved language, by user id.
 * @returns One plan per event, in the same order.
 */
export function planNotifications(
  events: NotifyEvent[],
  lookup: { preferences: Map<string, EmailPreferences>; locales: Map<string, string> },
): NotifyPlan[] {
  return events.map((event) => ({
    event,
    email: shouldEmail(event.type, lookup.preferences.get(event.userId) ?? {}),
    locale: emailLocale(lookup.locales.get(event.userId)),
  }));
}

import { sendMail } from '~~/server/utils/mail'

export interface EmailableUser {
  id: string
  primary_email: string
  notification_prefs: { email?: boolean } | null
}

/** Master kill-switch: a user with the email pref OFF receives NO email. */
export function isEmailEnabled(prefs: { email?: boolean } | null | undefined): boolean {
  return prefs?.email !== false
}

export type UserEmailResult = { sent: true } | { sent: false, reason: 'opted_out' }

/**
 * The single chokepoint for user-facing email. Every transactional/broadcast send
 * MUST go through here so the opt-out invariant cannot be bypassed.
 */
export async function sendUserEmail(
  user: EmailableUser,
  message: { subject: string, html: string, text?: string },
): Promise<UserEmailResult> {
  if (!isEmailEnabled(user.notification_prefs))
    return { sent: false, reason: 'opted_out' }
  await sendMail({ to: user.primary_email, subject: message.subject, html: message.html, text: message.text })
  return { sent: true }
}

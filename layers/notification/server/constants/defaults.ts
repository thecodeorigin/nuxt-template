/**
 * Notification layer defaults. Currently: the fixture set the demo-login
 * flow seeds into a fresh user's inbox so the empty state isn't jarring.
 */

export interface DemoNotificationDef {
  senderName: string
  body: string
}

export const DEMO_NOTIFICATIONS: readonly DemoNotificationDef[] = [
  { senderName: 'Jordan Brown', body: 'sent you a message' },
  { senderName: 'Taylor Green', body: 'sent you a message' },
  { senderName: 'Courtney Henry', body: 'added you to a project' },
  { senderName: 'Lindsay Walton', body: 'subscribed to your email list' },
  { senderName: 'Tom Cook', body: 'abandonned cart' },
  { senderName: 'Casey Thomas', body: 'purchased your product' },
  { senderName: 'Whitney Francis', body: 'commented on your post' },
  { senderName: 'Leonard Krasner', body: 'shared a file with you' },
]

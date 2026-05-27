import { db } from '@nuxthub/db'
import { notificationTable } from '@nuxthub/db/schema'
import { toNotification } from '#layers/notifications/shared/schemas/notification'

export async function createNotification(input: {
  userId: string
  organizationId: string
  senderName: string
  body: string
  dedupeKey?: string | null
}) {
  const [row] = await db.insert(notificationTable).values({
    user_id: input.userId,
    organization_id: input.organizationId,
    sender_name: input.senderName,
    body: input.body,
    dedupe_key: input.dedupeKey ?? null,
  }).onConflictDoNothing().returning()
  return row ? toNotification(row) : null
}

const DEMO_NOTIFICATIONS = [
  { senderName: 'Jordan Brown', body: 'sent you a message' },
  { senderName: 'Taylor Green', body: 'sent you a message' },
  { senderName: 'Courtney Henry', body: 'added you to a project' },
  { senderName: 'Lindsay Walton', body: 'subscribed to your email list' },
  { senderName: 'Tom Cook', body: 'abandonned cart' },
  { senderName: 'Casey Thomas', body: 'purchased your product' },
  { senderName: 'Whitney Francis', body: 'commented on your post' },
  { senderName: 'Leonard Krasner', body: 'shared a file with you' },
] as const

/** Idempotent (dedupe_key unique index) — safe to call on every demo login. */
export async function seedDemoNotifications(userId: string, organizationId: string) {
  const now = Date.now()
  for (let i = 0; i < DEMO_NOTIFICATIONS.length; i++) {
    const n = DEMO_NOTIFICATIONS[i]!
    await db.insert(notificationTable).values({
      user_id: userId,
      organization_id: organizationId,
      sender_name: n.senderName,
      body: n.body,
      is_read: i >= 3,
      dedupe_key: `demo-${i}`,
      created_at: new Date(now - i * 3_600_000),
    }).onConflictDoUpdate({
      target: [notificationTable.user_id, notificationTable.organization_id, notificationTable.dedupe_key],
      set: { is_read: i >= 3 },
    })
  }
}

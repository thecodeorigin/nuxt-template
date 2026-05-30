import { db } from '@nuxthub/db'
import { notificationTable } from '@nuxthub/db/schema'
import { toNotification } from '#layers/notification/shared/schemas/notification'

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

import type { NotificationRow } from '#layers/notifications/server/db/schema'
import { z } from 'zod'

export const NotificationSchema = z.object({
  id: z.string(),
  senderName: z.string(),
  body: z.string(),
  isRead: z.boolean(),
  createdAt: z.iso.datetime(),
})

export const NotificationQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export type Notification = z.infer<typeof NotificationSchema>
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>

export function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    senderName: row.sender_name,
    body: row.body,
    isRead: row.is_read,
    createdAt: row.created_at.toISOString(),
  }
}

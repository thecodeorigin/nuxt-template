import type { InferSelect } from '~~/server/db/types'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const notificationTable = sqliteTable('notifications', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  organization_id: text('organization_id').notNull(),
  user_id: text('user_id').notNull(),
  sender_name: text('sender_name').notNull(),
  body: text('body').notNull(),
  is_read: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  dedupe_key: text('dedupe_key'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('notifications_user_org_idx').on(table.user_id, table.organization_id),
  index('notifications_created_idx').on(table.created_at),
  uniqueIndex('notifications_dedupe_idx').on(table.user_id, table.organization_id, table.dedupe_key),
])

export type NotificationRow = InferSelect<typeof notificationTable>

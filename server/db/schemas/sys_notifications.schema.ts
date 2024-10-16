import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysUserTable } from './sys_users.schema'

export const sysNotificationTable = pgTable('sys_notifications', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  title: text('title'),
  message: text('message'),
  action: jsonb('action'),
  read_at: timestamp('read_at', { withTimezone: true }),
  user_id: uuid('user_id').references(() => sysUserTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const insertSysNotificationSchema = createInsertSchema(sysNotificationTable)

export const selectSysNotificationSchema = createSelectSchema(sysNotificationTable)

export const sysNotificationRelations = relations(sysNotificationTable, ({ one }) => ({
  owner: one(sysUserTable, {
    fields: [sysNotificationTable.user_id],
    references: [sysUserTable.id],
  }),
}))

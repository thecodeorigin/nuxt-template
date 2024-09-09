import { foreignKey, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUserSchema } from './sys_users.schema'

export const sysNotificationSchema = pgTable('sys_notifications', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  title: text('title'),
  message: text('message'),
  action: jsonb('action'),
  readAt: timestamp('read_at', { withTimezone: true }),
  userId: uuid('user_id').defaultRandom(),
}, (table) => {
  return {
    publicSysNotificationsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUserSchema.id],
      name: 'public_sys_notifications_user_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const sysNotificationsRelations = relations(sysNotificationSchema, ({ one }) => ({
  sysUser: one(sysUserSchema, {
    fields: [sysNotificationSchema.userId],
    references: [sysUserSchema.id],
  }),
}))

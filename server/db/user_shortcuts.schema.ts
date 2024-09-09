import { foreignKey, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUserSchema } from './sys_users.schema'

export const userShortcutSchema = pgTable('user_shortcuts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  route: text('route').notNull(),
  userId: uuid('user_id').defaultRandom(),
}, (table) => {
  return {
    publicUserShortcutsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUserSchema.id],
      name: 'public_user_shortcuts_user_id_fkey',
    }).onDelete('cascade'),
  }
})

export const userShortcutsRelations = relations(userShortcutSchema, ({ one }) => ({
  sysUser: one(sysUserSchema, {
    fields: [userShortcutSchema.userId],
    references: [sysUserSchema.id],
  }),
}))

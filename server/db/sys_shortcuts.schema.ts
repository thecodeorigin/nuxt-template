import { foreignKey, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUserSchema } from './sys_users.schema'

export const sysShortcutSchema = pgTable('sys_shortcuts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  item: text('item'),
  userId: uuid('user_id').notNull(),
}, (table) => {
  return {
    sysShortcutsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUserSchema.id],
      name: 'sys_shortcuts_user_id_fkey',
    }),
  }
})

export const sysShortcutsRelations = relations(sysShortcutSchema, ({ one }) => ({
  sysUser: one(sysUserSchema, {
    fields: [sysShortcutSchema.userId],
    references: [sysUserSchema.id],
  }),
}))

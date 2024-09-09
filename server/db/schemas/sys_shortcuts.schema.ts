import { foreignKey, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysUserTable } from './sys_users.schema'

export const sysShortcutTable = pgTable('sys_shortcuts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  item: text('item'),
  userId: uuid('user_id').notNull(),
}, (table) => {
  return {
    sysShortcutsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUserTable.id],
      name: 'sys_shortcuts_user_id_fkey',
    }),
  }
})

export const insertSysShortcutSchema = createInsertSchema(sysShortcutTable)

export const selectSysShortcutSchema = createSelectSchema(sysShortcutTable)

export const sysShortcutRelations = relations(sysShortcutTable, ({ one }) => ({
  sysUser: one(sysUserTable, {
    fields: [sysShortcutTable.userId],
    references: [sysUserTable.id],
  }),
}))

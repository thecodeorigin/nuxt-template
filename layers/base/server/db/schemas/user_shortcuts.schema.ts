import { foreignKey, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysUserTable } from './sys_users.schema'

export const userShortcutTable = pgTable('user_shortcuts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  route: text('route').notNull(),
  user_id: uuid('user_id').defaultRandom(),
}, (table) => {
  return {
    publicUserShortcutsUserIdFkey: foreignKey({
      columns: [table.user_id],
      foreignColumns: [sysUserTable.id],
      name: 'public_user_shortcuts_user_id_fkey',
    }).onDelete('cascade'),
  }
})

export const insertUserShortcutSchema = createInsertSchema(userShortcutTable)

export const selectUserShortcutSchema = createSelectSchema(userShortcutTable)

export const userShortcutRelations = relations(userShortcutTable, ({ one }) => ({
  owner: one(sysUserTable, {
    fields: [userShortcutTable.user_id],
    references: [sysUserTable.id],
  }),
}))

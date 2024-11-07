import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUserTable } from '@thecodeorigin/auth'

export const userShortcutTable = pgTable('user_shortcuts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  route: text('route').notNull(),
  user_id: uuid('user_id').references(() => sysUserTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
})

export const userShortcutRelations = relations(userShortcutTable, ({ one }) => ({
  owner: one(sysUserTable, {
    fields: [userShortcutTable.user_id],
    references: [sysUserTable.id],
  }),
}))

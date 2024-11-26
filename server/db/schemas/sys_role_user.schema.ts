import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysRoleTable } from './sys_roles.schema'
import { sysUserTable } from './sys_users.schema'

export const sysRoleUserTable = pgTable('sys_role_user', {
  role_id: uuid('role_id').references(() => sysRoleTable.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => sysUserTable.id, { onDelete: 'cascade' }).notNull(),
}, table => ({
  pk: primaryKey({ columns: [table.role_id, table.user_id] }),
}))

export const sysRoleUserRelation = relations(sysRoleUserTable, ({ one }) => ({
  role: one(sysRoleTable, {
    fields: [sysRoleUserTable.role_id],
    references: [sysRoleTable.id],
  }),
  user: one(sysUserTable, {
    fields: [sysRoleUserTable.user_id],
    references: [sysUserTable.id],
  }),
}))

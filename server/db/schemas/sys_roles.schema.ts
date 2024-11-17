import { relations } from 'drizzle-orm/relations'
import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { sysRolePermissionTable } from './sys_role_permission.schema'
import { sysRoleUserTable } from './sys_role_user.schema'

export const sysRoleTable = pgTable('sys_roles', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: text('name').notNull(),
})

export const sysRoleRelations = relations(sysRoleTable, ({ many }) => ({
  users: many(sysRoleUserTable),
  permissions: many(sysRolePermissionTable),
}))

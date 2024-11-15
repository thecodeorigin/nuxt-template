import { relations } from 'drizzle-orm/relations'
import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { sysUserTable } from './sys_users.schema'
import { sysPermissionTable } from './sys_permissions.schema'

export const sysRoleTable = pgTable('sys_roles', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: text('name').notNull().unique(),
})

export const sysRoleRelations = relations(sysRoleTable, ({ many }) => ({
  users: many(sysUserTable),
  permissions: many(sysPermissionTable),
}))

import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { PermissionAction, PermissionScope, permissionAction, permissionScope } from './enum.schema'
import { sysRolePermissionTable } from './sys_role_permission.schema'

export const sysPermissionTable = pgTable('sys_permissions', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  action: permissionAction('action').default(PermissionAction.READ).notNull(),
  subject: text('subject').notNull(),
  scope: permissionScope('scope').default(PermissionScope.ALL),
  scope_value: text('scope_value'),
})

export const sysPermissionRelations = relations(sysPermissionTable, ({ many }) => ({
  roles: many(sysRolePermissionTable),
}))

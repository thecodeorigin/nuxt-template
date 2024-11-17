import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysRoleTable } from './sys_roles.schema'
import { sysPermissionTable } from './sys_permissions.schema'

export const sysRolePermissionTable = pgTable('sys_role_permission', {
  role_id: uuid('role_id').references(() => sysRoleTable.id, { onDelete: 'cascade' }).notNull(),
  permission_id: uuid('permission_id').references(() => sysPermissionTable.id, { onDelete: 'cascade' }).notNull(),
}, table => ({
  pk: primaryKey({ columns: [table.role_id, table.permission_id] }),
}))

export const sysRolePermissionRelations = relations(sysRolePermissionTable, ({ one }) => ({
  role: one(sysRoleTable, {
    fields: [sysRolePermissionTable.role_id],
    references: [sysRoleTable.id],
  }),
  permission: one(sysPermissionTable, {
    fields: [sysRolePermissionTable.permission_id],
    references: [sysPermissionTable.id],
  }),
}))

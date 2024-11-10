import { pgTable, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysRoleTable } from './sys_roles.schema'
import { sysPermissionTable } from './sys_permissions.schema'

export const sysRolePermissionsTable = pgTable('sys_role_permissions', {
  role_id: uuid('role_id')
    .references(() => sysRoleTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  permission_id: uuid('permission_id')
    .references(() => sysPermissionTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
}, table => ({
  primaryKey: [table.role_id, table.permission_id],
}))

export const insertSysRolePermissionsSchema = createInsertSchema(sysRolePermissionsTable)

export const selectSysRolePermissionsSchema = createSelectSchema(sysRolePermissionsTable)

export const sysRolePermissionsRelations = relations(sysRolePermissionsTable, ({ one }) => ({
  role: one(sysRoleTable, {
    fields: [sysRolePermissionsTable.role_id],
    references: [sysRoleTable.id],
  }),
  permission: one(sysPermissionTable, {
    fields: [sysRolePermissionsTable.permission_id],
    references: [sysPermissionTable.id],
  }),
}))

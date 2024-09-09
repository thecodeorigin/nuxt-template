import { foreignKey, pgTable, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { permissionAction, permissionSubject } from './enum.schema'
import { sysRoleSchema } from './sys_roles.schema'

export const sysPermissionSchema = pgTable('sys_permissions', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  roleId: uuid('role_id'),
  action: permissionAction('action').default('read').notNull(),
  subject: permissionSubject('subject').notNull(),
}, (table) => {
  return {
    publicSysPermissionsRoleIdFkey: foreignKey({
      columns: [table.roleId],
      foreignColumns: [sysRoleSchema.id],
      name: 'public_sys_permissions_role_id_fkey',
    }).onDelete('cascade'),
  }
})

export const sysPermissionsRelations = relations(sysPermissionSchema, ({ one }) => ({
  sysRole: one(sysRoleSchema, {
    fields: [sysPermissionSchema.roleId],
    references: [sysRoleSchema.id],
  }),
}))

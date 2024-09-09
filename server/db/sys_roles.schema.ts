import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUserSchema } from './sys_users.schema'
import { sysPermissionSchema } from './sys_permissions.schema'

export const sysRoleSchema = pgTable('sys_roles', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: text('name'),
})

export const sysRolesRelations = relations(sysRoleSchema, ({ many }) => ({
  sysUserSchema: many(sysUserSchema),
  sysPermissionSchema: many(sysPermissionSchema),
}))

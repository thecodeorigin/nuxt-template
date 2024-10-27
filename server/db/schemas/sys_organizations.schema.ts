import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysUserTable } from './sys_users.schema'

export const sysOrganizationTable = pgTable('sys_organizations', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: text('name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
})

export const insertSysOrganizationSchema = createInsertSchema(sysOrganizationTable)

export const selectSysOrganizationSchema = createSelectSchema(sysOrganizationTable)

export const sysOrganizationRelations = relations(sysOrganizationTable, ({ many }) => ({
  users: many(sysUserTable),
}))

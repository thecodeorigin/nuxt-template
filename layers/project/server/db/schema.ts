import type { InferSelect } from '~~/server/db/types'
import { organizationTable, userTable } from '@nuxthub/db/schema'
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const projectTable = sqliteTable('projects', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  organization_id: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { enum: ['active', 'archived'] }).notNull().default('active'),
  created_by: text('created_by').references(() => userTable.id, { onDelete: 'set null' }),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index('projects_org_idx').on(table.organization_id),
  index('projects_status_idx').on(table.status),
])
export type Project = InferSelect<typeof projectTable>

export const projectProductTable = sqliteTable('project_products', {
  project_id: text('project_id').references(() => projectTable.id, { onDelete: 'cascade' }).notNull(),
  product_id: text('product_id').notNull(),
  quantity: integer('quantity').notNull().default(1),
  added_at: integer('added_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  primaryKey({ columns: [table.project_id, table.product_id] }),
])
export type ProjectProduct = InferSelect<typeof projectProductTable>

export const projectMemberTable = sqliteTable('project_members', {
  project_id: text('project_id').references(() => projectTable.id, { onDelete: 'cascade' }).notNull(),
  user_id: text('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  role: text('role', { enum: ['owner', 'member', 'viewer'] }).notNull().default('member'),
  added_at: integer('added_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  primaryKey({ columns: [table.project_id, table.user_id] }),
  index('project_members_user_idx').on(table.user_id),
])
export type ProjectMember = InferSelect<typeof projectMemberTable>

import type { InferSelect } from '~~/server/db/types'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { organizationTable, userTable } from '#layers/auth/server/db/schema'

export const todoTable = sqliteTable('todos', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  organization_id: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  user_id: text('user_id').references(() => userTable.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index('todos_org_idx').on(table.organization_id),
])
export type TodoRow = InferSelect<typeof todoTable>

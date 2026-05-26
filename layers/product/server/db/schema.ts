import type { InferSelect } from '~~/server/db/types'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const productTable = sqliteTable('products', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['one_time', 'recurring'] }).notNull().default('one_time'),
  price: integer('price').notNull(),
  price_currency: text('price_currency').notNull().default('USD'),
  billing_interval: text('billing_interval', { enum: ['month', 'year'] }),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index('products_status_idx').on(table.status),
  index('products_type_idx').on(table.type),
])

export type Product = InferSelect<typeof productTable>

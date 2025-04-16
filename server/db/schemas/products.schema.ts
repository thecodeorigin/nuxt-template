import { jsonb, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { orderTable } from './orders.schema'
import { ProductType, productType } from './enum.schema'

interface PricingPlanFeature {
  title: string
  icon?: string
}

export const productTable = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  title: text('title'),
  description: text('description'),
  price: numeric('price').notNull(),
  currency: text('currency').notNull(),
  amount: numeric('amount').notNull(),
  type: productType('type').default(ProductType.CREDIT).notNull(),
  features: jsonb('features').$type<string[] | PricingPlanFeature[]>().default([]),
  position: numeric('position'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const productRelations = relations(productTable, ({ many }) => ({
  orders: many(orderTable),
}))

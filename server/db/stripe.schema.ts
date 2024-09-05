import { bigint, boolean, foreignKey, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysUsers } from './sys.schema'
import { pricingPlanInterval, pricingType, subscriptionStatus } from './enum.schema'

export const stripeCustomers = pgTable('stripe_customers', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
})

export const stripeProducts = pgTable('stripe_products', {
  id: text('id').primaryKey().notNull(),
  active: boolean('active'),
  name: text('name'),
  description: text('description'),
  image: text('image'),
  metadata: jsonb('metadata'),
  marketingFeatures: jsonb('marketing_features').array().default([]),
})

export const stripePrices = pgTable('stripe_prices', {
  id: text('id').primaryKey().notNull(),
  productId: text('product_id'),
  active: boolean('active'),
  description: text('description'),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  unitAmount: bigint('unit_amount', { mode: 'number' }),
  currency: text('currency'),
  type: pricingType('type'),
  interval: pricingPlanInterval('interval'),
  intervalCount: integer('interval_count'),
  trialPeriodDays: integer('trial_period_days'),
  metadata: jsonb('metadata'),
}, (table) => {
  return {
    stripePricesProductIdFkey: foreignKey({
      columns: [table.productId],
      foreignColumns: [stripeProducts.id],
      name: 'stripe_prices_product_id_fkey',
    }),
  }
})

export const stripeSubscriptions = pgTable('stripe_subscriptions', {
  id: text('id').primaryKey().notNull(),
  userId: uuid('user_id').notNull(),
  status: subscriptionStatus('status'),
  metadata: jsonb('metadata'),
  priceId: text('price_id'),
  quantity: integer('quantity'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end'),
  created: timestamp('created', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  cancelAt: timestamp('cancel_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  canceledAt: timestamp('canceled_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  trialStart: timestamp('trial_start', { withTimezone: true, mode: 'string' }).defaultNow(),
  trialEnd: timestamp('trial_end', { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => {
  return {
    stripeSubscriptionsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [sysUsers.id],
      name: 'stripe_subscriptions_user_id_fkey',
    }),
    stripeSubscriptionsPriceIdFkey: foreignKey({
      columns: [table.priceId],
      foreignColumns: [stripePrices.id],
      name: 'stripe_subscriptions_price_id_fkey',
    }),
  }
})

export const stripePricesRelations = relations(stripePrices, ({ one, many }) => ({
  stripeProduct: one(stripeProducts, {
    fields: [stripePrices.productId],
    references: [stripeProducts.id],
  }),
  stripeSubscriptions: many(stripeSubscriptions),
}))

export const stripeProductsRelations = relations(stripeProducts, ({ many }) => ({
  stripePrices: many(stripePrices),
}))

export const stripeSubscriptionsRelations = relations(stripeSubscriptions, ({ one }) => ({
  sysUser: one(sysUsers, {
    fields: [stripeSubscriptions.userId],
    references: [sysUsers.id],
  }),
  stripePrice: one(stripePrices, {
    fields: [stripeSubscriptions.priceId],
    references: [stripePrices.id],
  }),
}))

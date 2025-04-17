import { boolean, jsonb, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { identityTable } from './identities.schema'
import { deviceTable } from './devices.schema'
import { creditHistoryTable } from './credit_histories.schema'
import { notificationTable } from './notifications.schema'
import { orderTable } from './orders.schema'
import { paymentTable } from './payments.schema'

export const userTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  logto_id: text('logto_id').notNull().unique(),

  // User profile data
  username: text('username'),
  name: text('name'),
  primary_email: text('primary_email'),
  primary_phone: text('primary_phone'),
  avatar: text('avatar'),

  // Custom fields from your original profiles schema
  facebook: text('facebook'),
  zalo: text('zalo'),
  credit: numeric('credit'),

  // Notification settings with default values
  email_notifications: boolean('email_notifications').default(true),
  desktop_notifications: boolean('desktop_notifications').default(true),
  product_updates_notifications: boolean('product_updates_notifications').default(true),
  weekly_digest_notifications: boolean('weekly_digest_notifications').default(true),
  important_updates_notifications: boolean('important_updates_notifications').default(true),

  // Additional Logto metadata
  custom_data: jsonb('custom_data').default({}),
  last_sign_in_at: timestamp('last_sign_in_at', { withTimezone: true }),
  is_suspended: boolean('is_suspended').default(false),
  has_password: boolean('has_password').default(false),

  // Timestamps
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
})

export const userRelations = relations(userTable, ({ many }) => ({
  identities: many(identityTable),
  devices: many(deviceTable),
  creditHistories: many(creditHistoryTable),
  notifications: many(notificationTable),
  orders: many(orderTable),
  payments: many(paymentTable),
}))

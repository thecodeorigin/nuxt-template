import type { InferSelect } from '~~/server/db/types'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { organizationTable, userTable } from '#layers/auth/server/db/schema'

export const organizationBillingSettingsTable = sqliteTable('organization_billing_settings', {
  organization_id: text('organization_id').primaryKey().references(() => organizationTable.id, { onDelete: 'cascade' }),
  company_name: text('company_name'),
  tax_id: text('tax_id'),
  address: text('address'),
  city: text('city'),
  country: text('country').default('US'),
  currency: text('currency').notNull().default('USD'),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})
export type OrganizationBillingSettings = InferSelect<typeof organizationBillingSettingsTable>

export const invoiceTable = sqliteTable('invoices', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  organization_id: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  number: text('number').notNull().unique(),
  status: text('status', { enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] }).notNull().default('draft'),
  currency: text('currency').notNull().default('USD'),
  subtotal: integer('subtotal').notNull().default(0),
  tax: integer('tax').notNull().default(0),
  total: integer('total').notNull().default(0),
  issued_at: integer('issued_at', { mode: 'timestamp' }),
  due_at: integer('due_at', { mode: 'timestamp' }),
  paid_at: integer('paid_at', { mode: 'timestamp' }),
  notes: text('notes'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index('invoices_org_idx').on(table.organization_id),
  index('invoices_status_idx').on(table.status),
])
export type Invoice = InferSelect<typeof invoiceTable>

export const invoiceItemTable = sqliteTable('invoice_items', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  invoice_id: text('invoice_id').references(() => invoiceTable.id, { onDelete: 'cascade' }).notNull(),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unit_price: integer('unit_price').notNull(),
  currency: text('currency').notNull().default('USD'),
  amount: integer('amount').notNull(),
}, table => [
  index('invoice_items_invoice_idx').on(table.invoice_id),
])
export type InvoiceItem = InferSelect<typeof invoiceItemTable>

export const organizationCreditTable = sqliteTable('organization_credits', {
  organization_id: text('organization_id').primaryKey().references(() => organizationTable.id, { onDelete: 'cascade' }),
  balance: integer('balance').notNull().default(0),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})
export type OrganizationCredit = InferSelect<typeof organizationCreditTable>

export const transactionTable = sqliteTable('transactions', {
  id: text('id').primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  organization_id: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  user_id: text('user_id').references(() => userTable.id, { onDelete: 'set null' }),
  type: text('type', { enum: ['top_up', 'referral_reward'] }).notNull(),
  status: text('status', { enum: ['pending', 'success', 'failed', 'expired'] }).notNull().default('pending'),
  amount: integer('amount').notNull(),
  gateway_ref: text('gateway_ref').unique(),
  sepay_event_id: text('sepay_event_id').unique(),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  expires_at: integer('expires_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index('transactions_org_idx').on(table.organization_id),
  index('transactions_status_idx').on(table.status),
])
export type Transaction = InferSelect<typeof transactionTable>

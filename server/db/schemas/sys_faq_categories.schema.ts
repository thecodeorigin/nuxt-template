import { pgTable, smallint, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysFaqTable } from './sys_faqs.schema'

export const sysFaqCategoryTable = pgTable('sys_faq_categories', {
  id: smallint('id').primaryKey().generatedByDefaultAsIdentity({ name: 'sys_faq_categories_id_seq', startWith: 1, increment: 1, minValue: 1, maxValue: 32767, cache: 1 }),
  title: text('title'),
  icon: text('icon'),
  subtitle: text('subtitle'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const insertSysFaqCategorySchema = createInsertSchema(sysFaqCategoryTable)

export const selectSysFaqCategorySchema = createSelectSchema(sysFaqCategoryTable)

export const sysFaqCategoryRelations = relations(sysFaqCategoryTable, ({ many }) => ({
  faqs: many(sysFaqTable),
}))

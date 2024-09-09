import { pgTable, smallint, text } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysFaqSchema } from './sys_faqs.schema'

export const sysFaqCategorySchema = pgTable('sys_faq_categories', {
  id: smallint('id').primaryKey().generatedByDefaultAsIdentity({ name: 'sys_faq_categories_id_seq', startWith: 1, increment: 1, minValue: 1, maxValue: 32767, cache: 1 }),
  title: text('title'),
  icon: text('icon'),
  subtitle: text('subtitle'),
})

export const sysFaqCategoriesRelations = relations(sysFaqCategorySchema, ({ many }) => ({
  sysFaqSchema: many(sysFaqSchema),
}))

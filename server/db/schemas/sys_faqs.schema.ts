import { pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysFaqCategoryTable } from './sys_faq_categories.schema'

export const sysFaqTable = pgTable('sys_faqs', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  answer: text('answer'),
  category_id: smallint('category_id')
    .references(() => sysFaqCategoryTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  question: text('question'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const sysFaqRelations = relations(sysFaqTable, ({ one }) => ({
  category: one(sysFaqCategoryTable, {
    fields: [sysFaqTable.category_id],
    references: [sysFaqCategoryTable.id],
  }),
}))

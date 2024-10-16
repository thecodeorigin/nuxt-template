import { foreignKey, pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysFaqCategoryTable } from './sys_faq_categories.schema'

export const sysFaqTable = pgTable('sys_faqs', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  answer: text('answer'),
  category_id: smallint('category_id')
    .references(() => sysFaqCategoryTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  question: text('question'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const insertSysFaqSchema = createInsertSchema(sysFaqTable)

export const selectSysFaqSchema = createSelectSchema(sysFaqTable)

export const sysFaqRelations = relations(sysFaqTable, ({ one }) => ({
  category: one(sysFaqCategoryTable, {
    fields: [sysFaqTable.category_id],
    references: [sysFaqCategoryTable.id],
  }),
}))

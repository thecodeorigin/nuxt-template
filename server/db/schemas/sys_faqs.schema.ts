import { foreignKey, pgTable, smallint, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { sysFaqCategoryTable } from './sys_faq_categories.schema'

export const sysFaqTable = pgTable('sys_faqs', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  answer: text('answer'),
  categoryId: smallint('category_id'),
  question: text('question'),
}, (table) => {
  return {
    publicSysFaqsCategoryIdFkey: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [sysFaqCategoryTable.id],
      name: 'public_sys_faqs_category_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const insertSysFaqSchema = createInsertSchema(sysFaqTable)

export const selectSysFaqSchema = createSelectSchema(sysFaqTable)

export const sysFaqRelations = relations(sysFaqTable, ({ one }) => ({
  sysFaqCategory: one(sysFaqCategoryTable, {
    fields: [sysFaqTable.categoryId],
    references: [sysFaqCategoryTable.id],
  }),
}))

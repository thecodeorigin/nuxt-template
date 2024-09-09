import { foreignKey, pgTable, smallint, text, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { sysFaqCategorySchema } from './sys_faq_categories.schema'

export const sysFaqSchema = pgTable('sys_faqs', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  answer: text('answer'),
  categoryId: smallint('category_id'),
  question: text('question'),
}, (table) => {
  return {
    publicSysFaqsCategoryIdFkey: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [sysFaqCategorySchema.id],
      name: 'public_sys_faqs_category_id_fkey',
    }).onUpdate('cascade').onDelete('cascade'),
  }
})

export const sysFaqsRelations = relations(sysFaqSchema, ({ one }) => ({
  sysFaqCategory: one(sysFaqCategorySchema, {
    fields: [sysFaqSchema.categoryId],
    references: [sysFaqCategorySchema.id],
  }),
}))

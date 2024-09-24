import type { InferSelectModel } from 'drizzle-orm'
import type { sysFaqTable } from '@/server/db/schemas/sys_faqs.schema.js'
import type { sysFaqCategoryTable } from '@/server/db/schemas/sys_faq_categories.schema.js'

type Faq = InferSelectModel<typeof sysFaqTable>
type FaqCategory = InferSelectModel<typeof sysFaqCategoryTable>

type Faqs = FaqCategory & {
  questions: Faq[]
}

export const useFaqStore = defineStore('faq', () => {
  async function fetchFaqs(query: Partial<ParsedFilterQuery>) {
    return $api<Faqs[]>('/faq', {
      query,
    })
  }

  return {
    fetchFaqs,
  }
})

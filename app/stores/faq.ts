import type { InferSelectModel } from 'drizzle-orm'
import type { sysFaqTable, sysFaqCategoryTable } from '@base/server/db/schemas'

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

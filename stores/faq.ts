import type { Tables } from '@/server/types/supabase'

type FaqCategory = Tables<'sys_faq_categories'>
type Faq = Tables<'sys_faqs'>

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

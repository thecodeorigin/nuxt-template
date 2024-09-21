import { and, eq } from 'drizzle-orm'
import { sysFaqTable } from '../db/schemas/sys_faqs.schema'
import { sysFaqCategoryTable } from '../db/schemas/sys_faq_categories.schema'
import { useCrud } from './useCrud'

export function useFaqCrud() {
  const { getRecordsPaginated: getRecordsFaqCategories } = useCrud(sysFaqCategoryTable)

  const { getRecordsPaginated } = useCrud(sysFaqTable, {
    searchBy: ['question'],
  })

  async function getFaqQuestions(options: ParsedFilterQuery) {
    const { data: categories } = await getRecordsFaqCategories({})

    const { data: faqs } = await getRecordsPaginated(options)

    const faqCategories = categories.map(category => ({ ...category, questions: [] as typeof faqs }))

    for (const faq of faqs) {
      const category = faqCategories.find(item => item.id === faq.category_id)
      if (category) {
        category.questions.push(faq)
      }
    }
    return faqCategories
  }

  return {
    getFaqQuestions,
  }
}

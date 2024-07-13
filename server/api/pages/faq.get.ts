import is from '@sindresorhus/is'

export default defineEventHandler(async (event) => {
  const { q = '' } = getQuery(event)

  const searchQuery = is.string(q) ? q : undefined
  const queryLowered = (searchQuery ?? '').toString().toLowerCase()

  const { data: categories } = await supabase.from('sys_faq_categories').select()
  const { data: faqs } = await supabase.from('sys_faqs').select().ilike('question', `%${queryLowered}%`)

  const result = categories?.map((category) => {
    const categoryFaqs = faqs?.filter(faq => faq.category_id === category.id) ?? []
    return {
      ...category,
      questions: categoryFaqs,
    }
  }) ?? []
  console.log('result', result, categories, faqs)

  setResponseStatus(event, 200)

  return result
})

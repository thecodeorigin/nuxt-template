import is from '@sindresorhus/is'

export default defineEventHandler(async (event) => {
  const { q = '' } = getQuery(event)
  const searchQuery = is.string(q) ? q : undefined
  const queryLowered = (searchQuery ?? '').toString().toLowerCase()

  const { data: categories } = await supabase.from('sys_faq_categories').select('*,questions:sys_faqs(*)').ilike('sys_faqs.question', `%${queryLowered}%`)
  setResponseStatus(event, 200)
  console.log('categories:', categories)

  return categories
})

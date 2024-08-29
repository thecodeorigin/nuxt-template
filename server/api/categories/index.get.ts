export default defineEventHandler(async (event) => {
  console.log('HEEEEEEEEEEEEEEEEEEEEEEEEEEEE')
  const { session } = await defineEventOptions(event, { auth: true })

  const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1 } = getFilter(event)

  const { data, error } = await supabaseAdmin.from('categories')
    .select('*', { count: 'exact' })
    .match({ user_id: session.user!.id! })
    .or(`name.ilike.${keyword || '%%'},name.ilike.${keywordLower || '%%'}`)
    .order(sortBy, { ascending: sortAsc })
    .range(page - 1, (page - 1) + limit)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return data
})

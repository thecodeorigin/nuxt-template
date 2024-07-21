export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  const { keyword = '', keywordLower = '', sortBy, sortAsc = true, limit = 10, page = 1 } = getFilter(event)

  const { data, error } = await supabaseAdmin.from('posts')
    .select('*', { count: 'exact', head: true })
    .match({
      user_id: session.user!.id!,
    })
    .or(`title.ilike.${keyword || ''},title.ilike.${keywordLower || ''}`)
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

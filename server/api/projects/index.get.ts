export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1 } = getFilter(event)

  const { data, error } = await supabaseAdmin.from('projects')
    .select('*', { count: 'exact' })
    .match({ user_id: session.user!.id! })
    .or(`title.ilike.%${keyword || '%%'}%,title.ilike.%${keywordLower || '%%'}%`)
    .order(sortBy, { ascending: sortAsc })
    .range((page - 1) * limit, page * limit - 1)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return data
})

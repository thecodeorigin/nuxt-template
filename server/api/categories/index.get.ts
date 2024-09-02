export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  const { keyword = '', keywordLower = '', sortBy = 'created_at', sortAsc = true, limit = 10, page = 1, parent_id } = getFilter(event)

  let categoryQueryBuilder = supabaseAdmin.from('categories')
    .select('*', { count: 'exact' })

  if (parent_id) {
    categoryQueryBuilder = categoryQueryBuilder.match({
      user_id: session.user!.id!,
      parent_id,
    })
  }
  else {
    categoryQueryBuilder = categoryQueryBuilder
      .match({
        user_id: session.user!.id!,
      })
      .is('parent_id', null)
  }

  const { data, error } = await categoryQueryBuilder.or(
    [
      `name.ilike.%${keyword || ''}%`,
      `name.ilike.%${keywordLower || ''}%`,
      `description.ilike.%${keyword || ''}%`,
      `description.ilike.%${keywordLower || ''}%`,
    ].join(','),
  )
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

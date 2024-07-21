export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  const { keyword = '', keywordLower = '', sortBy, sortAsc = true, limit = 10, page = 1 } = getFilter(event)

  const { data, error } = await supabaseAdmin.from('sys_roles')
    .select('*, permissions:sys_permissions(*)', { count: 'exact', head: true })
    .or(`name.ilike.${keyword || ''},name.ilike.${keywordLower || ''}`)
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

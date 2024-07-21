export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  const { keyword = '', keywordLower = '', sortBy, sortAsc = true, limit = 10, page = 1 } = getFilter(event)

  const { data, count } = await supabase.from('sys_users')
    .select('*', { count: 'exact', head: true })
    .or(`full_name.ilike.${keyword || ''},full_name.ilike.${keywordLower || ''}`)
    .order(sortBy, { ascending: sortAsc })
    .range(page - 1, (page - 1) + limit)

  setResponseStatus(event, 200)

  return {
    data,
    count,
  }
})

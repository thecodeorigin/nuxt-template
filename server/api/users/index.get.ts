import is from '@sindresorhus/is'
import { destr } from 'destr'

export default defineEventHandler(async (event) => {
  const { q = '', sortBy, sortAscending = true, limit = 10, page = 1 } = getQuery(event)

  const parsedQuery = is.string(q) ? q : undefined
  const parsedQueryLower = (parsedQuery ?? '').toString().toLowerCase()

  const parsedSortBy = destr<string>(sortBy)
  const parsedSortAscending = destr<boolean>(sortAscending)
  const parsedLimit = destr<number>(limit)
  const parsedPage = destr<number>(page)

  const { data, count } = await supabase.from('sys_users')
    .select('*', { count: 'exact', head: true })
    .or(`full_name.ilike.${parsedQuery || ''},full_name.ilike.${parsedQueryLower || ''}`)
    .order(parsedSortBy, { ascending: parsedSortAscending })
    .range(parsedPage - 1, (parsedPage - 1) + parsedLimit)

  setResponseStatus(event, 200)

  return {
    data,
    count,
  }
})

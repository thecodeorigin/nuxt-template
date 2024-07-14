import type { H3Event } from 'h3'
import is from '@sindresorhus/is'
import { destr } from 'destr'

export function getFilter(event: H3Event) {
  const { keyword = '', sortBy, sortAscending = true, limit = 10, page = 1 } = getQuery(event)

  const parsedQuery = is.string(keyword) ? keyword : undefined
  const parsedQueryLower = (parsedQuery ?? '').toString().toLowerCase()

  const parsedSortBy = destr<string>(sortBy)
  const parsedSortAscending = destr<boolean>(sortAscending)
  const parsedLimit = destr<number>(limit)
  const parsedPage = destr<number>(page)

  return {
    keyword: parsedQuery,
    keywordLower: parsedQueryLower,
    sortBy: parsedSortBy,
    sortAsc: parsedSortAscending,
    limit: parsedLimit,
    page: parsedPage,
  }
}

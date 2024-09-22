import type { H3Event } from 'h3'
import { destr } from 'destr'

export interface ParsedFilterQuery {
  [key: string]: any
  keyword: string
  keywordLower: string
  sortBy: string
  sortAsc: boolean
  limit: number
  page: number
  withCount: boolean
}

export function getFilter(event: H3Event) {
  const query = getQuery(event)

  const parsedQuery = (query.keyword || '') as string
  const parsedQueryLower = (parsedQuery ?? '').toString().toLowerCase()

  const parsedSortBy = destr<string>(query.sortBy)
  const parsedSortAscending = destr<boolean>(query.sortAscending)
  const parsedWithCount = destr<boolean>(query.withCount)
  const parsedLimit = destr<number>(query.limit)
  const parsedPage = destr<number>(query.page)

  return {
    ...query,
    keyword: parsedQuery,
    keywordLower: parsedQueryLower,
    sortBy: parsedSortBy,
    sortAsc: parsedSortAscending,
    limit: parsedLimit,
    page: parsedPage,
    withCount: parsedWithCount,
  } as ParsedFilterQuery
}

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

export function getFilter(event: H3Event, defaultOptions: Partial<ParsedFilterQuery> = {}): ParsedFilterQuery {
  const query = getQuery(event)

  const parsedKeyword = (query.keyword || '') as string || defaultOptions.keyword
  const parsedKeywordLower = (parsedKeyword ?? '').toString().toLowerCase() || defaultOptions.keywordLower

  const parsedSortBy = destr<string>(query.sortBy) || defaultOptions.sortBy
  const parsedSortAscending = destr<boolean>(query.sortAsc) || defaultOptions.sortAsc
  const parsedWithCount = destr<boolean>(query.withCount) || defaultOptions.withCount
  const parsedLimit = destr<number>(query.limit) || defaultOptions.limit
  const parsedPage = destr<number>(query.page) || defaultOptions.page

  return {
    ...query,
    keyword: parsedKeyword,
    keywordLower: parsedKeywordLower,
    sortBy: parsedSortBy,
    sortAsc: parsedSortAscending,
    limit: parsedLimit,
    page: parsedPage,
    withCount: parsedWithCount,
  } as ParsedFilterQuery
}

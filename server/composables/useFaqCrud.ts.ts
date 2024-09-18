import type { SQL } from 'drizzle-orm'
import { and, eq } from 'drizzle-orm'
import { sysFaqTable } from '../db/schemas/sys_faqs.schema'
import { useCrud } from './useCrud'

interface QueryRestrict {
  category_id: number
}
export function useUserDeviceCrud(queryRestrict: QueryRestrict) {
  const conditionsMap = [
    { field: 'category_id', condition: eq(sysFaqTable.category_id, queryRestrict.category_id) },
  ]
  const conditionsArray = [] as SQL<unknown>[]

  for (const condition of conditionsMap) {
    if (queryRestrict[condition.field as keyof QueryRestrict]) {
      conditionsArray.push(condition.condition)
    }
  }
  const { getRecordsPaginated } = useCrud(sysFaqTable, {
    searchBy: ['question'],
    queryRestrict: () => and(
      ...conditionsArray,
    ),
  })

  async function getFaqQuestions(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)
    return { data, total }
  }

  return {
    getFaqQuestions,
  }
}

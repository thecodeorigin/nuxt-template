import { and, eq, isNull } from 'drizzle-orm'
import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { useCrud } from '@base/server/composables/useCrud'
import { categoryTable } from '../db/schemas/category.schema'

export function useCategoryCrud(queryRestrict:
{
  user_id: string
  parent_id?: string
}) {
  const {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(categoryTable, {
    searchBy: ['name', 'description'],
    queryRestrict: () => and(
      ...[
        eq(categoryTable.user_id, queryRestrict.user_id),
        queryRestrict.parent_id
          ? eq(categoryTable.parent_id, queryRestrict.parent_id)
          : isNull(categoryTable.parent_id),
      ],
    ),
  })

  async function getCategorysPaginated(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)

    return { data, total }
  }

  async function getCategoryById(id: string) {
    const { data } = await getRecordByKey('id', id)

    return { data }
  }

  async function updateCategoryById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)

    return { data }
  }

  async function createCategory(body: any) {
    const { data } = await createRecord(body)

    return { data }
  }

  async function deleteCategoryById(id: string) {
    const { data } = await deleteRecordByKey('id', id)

    return { data }
  }

  function countCategorys() {
    return countRecords()
  }

  return {
    getCategorysPaginated,
    getCategoryById,
    createCategory,
    updateCategoryById,
    deleteCategoryById,
    countCategorys,
  }
}

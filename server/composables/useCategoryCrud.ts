import { categoryTable } from '../db/schemas/category.schema'
import { useCrud } from './useCrud'
import type { ParsedFilterQuery } from '~/server/utils/filter'

export function useCategoryCrud() {
  const {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(categoryTable, {
    searchBy: ['name'],
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

import { and, eq, isNull } from 'drizzle-orm'
import type { ParsedFilterQuery } from '@materialize/server/utils/filter'
import { useCrud } from '@materialize/server/composables/useCrud'
import { projectTable } from '../db/schemas/project.schema'

export function useProjectCrud(queryRestrict:
{
  user_id?: string
  category_id?: string | any
}) {
  const {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(projectTable, {
    searchBy: ['title', 'description'],
    queryRestrict: () => and(...[
      queryRestrict.user_id && eq(projectTable.user_id, queryRestrict.user_id),
      queryRestrict.category_id && eq(projectTable.category_id, queryRestrict.category_id),
    ].filter(Boolean)),
  })

  async function getProjectsPaginated(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)

    return { data, total }
  }

  async function getProjectById(id: string) {
    const { data } = await getRecordByKey('id', id)

    return { data }
  }

  async function updateProjectById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)

    return { data }
  }

  async function createProject(body: any) {
    const { data } = await createRecord(body)

    return { data }
  }

  async function deleteProjectById(id: string) {
    const { data } = await deleteRecordByKey('id', id)

    return { data }
  }

  function countProjects() {
    return countRecords()
  }

  return {
    getProjectsPaginated,
    getProjectById,
    createProject,
    updateProjectById,
    deleteProjectById,
    countProjects,
  }
}

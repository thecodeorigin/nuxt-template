import { projectTable } from '../db/schemas/project.schema'
import { useCrud } from './useCrud'
import type { ParsedFilterQuery } from '~/server/utils/filter'

export function useProjectCrud() {
  const {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(projectTable, {
    searchBy: ['title', 'description'],
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

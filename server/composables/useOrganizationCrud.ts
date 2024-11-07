import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysOrganizationTable } from '@base/server/db/schemas'
import { useCrud } from './useCrud'

export function useOrganizationCrud() {
  const {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(sysOrganizationTable, {
    searchBy: ['name'],
  })

  async function getOrganizationsPaginated(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)

    return { data, total }
  }

  async function getOrganizationById(id: string) {
    const { data } = await getRecordByKey('id', id)

    return { data }
  }

  async function getOrganizationByName(name: string) {
    const { data } = await getRecordByKey('name', name)

    return { data }
  }

  async function updateOrganizationById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)

    return { data }
  }

  async function createOrganization(body: any) {
    const { data } = await createRecord(body)

    return { data }
  }

  async function deleteOrganizationById(id: string) {
    const { data } = await deleteRecordByKey('id', id)

    return { data }
  }

  function countOrganizations() {
    return countRecords()
  }

  return {
    getOrganizationsPaginated,
    getOrganizationById,
    getOrganizationByName,
    createOrganization,
    updateOrganizationById,
    deleteOrganizationById,
    countOrganizations,
  }
}

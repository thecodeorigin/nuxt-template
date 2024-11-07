import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'
import { useCrud } from './useCrud'

export function usePermissionCrud() {
  const {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(sysPermissionTable, {
    searchBy: ['action'],
  })

  async function getPermissionsPaginated(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)

    return { data, total }
  }

  async function getPermissionById(id: string) {
    const { data } = await getRecordByKey('id', id)

    return { data }
  }

  async function createPermission(body: any) {
    const permission = await createRecord(body)

    return permission
  }

  async function updatePermissionById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)

    return { data }
  }

  async function deletePermissionById(id: string) {
    const { data } = await deleteRecordByKey('id', id)

    return { data }
  }

  function getPermissionCount() {
    return countRecords()
  }

  return {
    getPermissionsPaginated,
    getPermissionById,
    createPermission,
    updatePermissionById,
    deletePermissionById,
    getPermissionCount,
  }
}

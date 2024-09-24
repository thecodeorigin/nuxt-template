import { sysRoleTable } from '../db/schemas/sys_roles.schema'
import { useCrud } from './useCrud'
import type { ParsedFilterQuery } from '@/server/utils/filter'

export function useRoleCrud() {
  const {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(sysRoleTable, {
    searchBy: ['name'],
  })

  async function getRolesPaginated(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)

    return { data, total }
  }

  async function getRoleById(id: string) {
    const { data } = await getRecordByKey('id', id)

    return { data }
  }

  async function getRoleByName(name: string) {
    const { data } = await getRecordByKey('name', name)

    return { data }
  }

  async function updateRoleById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)

    return { data }
  }

  async function createRole(body: any) {
    const { data } = await createRecord(body)

    return { data }
  }

  async function deleteRoleById(id: string) {
    const { data } = await deleteRecordByKey('id', id)

    return { data }
  }

  function countRoles() {
    return countRecords()
  }

  return {
    getRolesPaginated,
    getRoleById,
    getRoleByName,
    createRole,
    updateRoleById,
    deleteRoleById,
    countRoles,
  }
}

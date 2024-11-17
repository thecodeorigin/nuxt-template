import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysRoleTable } from '@base/server/db/schemas'
import { eq } from 'drizzle-orm'
import { useCrud } from './useCrud'

export function useRoleCrud() {
  const {
    getRecordsPaginated,
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
    const data = await db.query.sysRoleTable.findFirst({
      where: sysRoleTable => eq(sysRoleTable.id, id),
      with: {
        permissions: true,
      },
    })

    return data
  }

  async function getRoleByName(name: string) {
    const data = await db.query.sysRoleTable.findFirst({
      where: sysRoleTable => eq(sysRoleTable.name, name),
      with: {
        permissions: true,
      },
    })

    return data
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

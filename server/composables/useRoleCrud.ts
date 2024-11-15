import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysRolePermissionTable, sysRoleTable } from '@base/server/db/schemas'
import { eq } from 'drizzle-orm'
import { useCrud } from './useCrud'
import type { PivotRolePermission } from '~/stores/admin/role'
import type { Permission } from '~/stores/admin/permission'

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

  async function updateRoleById(id: string, body: PivotRolePermission) {
    await db.update(sysRoleTable)
      .set({ name: body.name })
      .where(eq(sysRoleTable.id, id))

    await db.delete(sysRolePermissionTable)
      .where(eq(sysRolePermissionTable.role_id, id))

    if (!body.permissions || !body.permissions.length)
      return

    const newSysRolePermissions = await db.insert(sysRolePermissionTable)
      .values(
        body.permissions.map((permission: Permission) => ({
          role_id: id,
          permission_id: permission.id,
        })),
      )
      .returning()

    return { data: newSysRolePermissions }
  }

  async function createRole(body: PivotRolePermission) {
    if (!body.name) {
      throw new Error('Role name is required.')
    }

    const existingRole = await getRoleByName(body.name)

    if (existingRole.data) {
      throw new Error(`A role with the name "${body.name}" already exists.`)
    }

    const sysRole = await db.insert(sysRoleTable)
      .values({ name: body.name })
      .returning({ id: sysRoleTable.id })

    const newRoleId = sysRole[0].id

    const sysRolePermissions = await db.insert(sysRolePermissionTable)
      .values(
        body.permissions.map((permission: Permission) => ({
          role_id: newRoleId,
          permission_id: permission.id,
        })),
      )
      .returning()

    return { data: sysRolePermissions }
  }

  async function deleteRoleById(id: string) {
    await db.delete(sysRolePermissionTable)
      .where(eq(sysRolePermissionTable.role_id, id))

    await db.delete(sysRoleTable)
      .where(eq(sysRoleTable.id, id))

    return {
      message: `Role with id: ${id} has been deleted successfully`,
    }
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

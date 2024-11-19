import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysRolePermissionTable } from '@base/server/db/schemas/sys_role_permission.schema'
import { and, eq, ilike, or } from 'drizzle-orm'
import { sysPermissionTable, sysRoleTable } from '../db/schemas'
import { useCrud } from './useCrud'

export function useRolePermissionCrud() {
  const {
    getRecordsPaginated,
  } = useCrud(sysRolePermissionTable)

  async function getRolePermissions(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)

    return { data, total }
  }

  async function syncRolesPermissions() {
    const roles = await db.select().from(sysRoleTable)

    const permissions = await db.select().from(sysPermissionTable)

    const rolePermissions = []

    for (const role of roles) {
      for (const permission of permissions) {
        if (permission.role_id === role.id) {
          // Check if this mapping already exists
          const existingMapping = await db
            .select()
            .from(sysRolePermissionTable)
            .where(
              and(
                eq(sysRolePermissionTable.role_id, role.id),
                eq(sysRolePermissionTable.permission_id, permission.id),
              ),
            )

          // If mapping does not exist, add it to the batch
          if (existingMapping.length === 0) {
            rolePermissions.push({
              role_id: role.id,
              permission_id: permission.id,
            })
          }
        }
      }
    }

    if (rolePermissions.length > 0) {
      await db.insert(sysRolePermissionTable).values(rolePermissions)
    }
  }

  async function getJoinRolePermissions() {
    const rolePermissions = await db
      .select({
        role_id: sysRolePermissionTable.role_id,
        permission_id: sysRolePermissionTable.permission_id,
        role_name: sysRoleTable.name,
        permission_action: sysPermissionTable.action,
      })
      .from(sysRolePermissionTable)
      .innerJoin(sysRoleTable, eq(sysRolePermissionTable.role_id, sysRoleTable.id))
      .innerJoin(sysPermissionTable, eq(sysRolePermissionTable.permission_id, sysPermissionTable.id))

    return rolePermissions
  }

  return { getRolePermissions, getJoinRolePermissions, syncRolesPermissions }
}

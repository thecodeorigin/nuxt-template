import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysRolePermissionsTable } from '@base/server/db/schemas/sys_roles_permissions.schema'
import { and, eq, ilike, or } from 'drizzle-orm'
import { sysPermissionTable, sysRoleTable } from '../db/schemas'
import { useCrud } from './useCrud'

export function useRolePermissionCrud() {
  const {
    getRecordsPaginated,
  } = useCrud(sysRolePermissionsTable)

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
            .from(sysRolePermissionsTable)
            .where(
              and(
                eq(sysRolePermissionsTable.role_id, role.id),
                eq(sysRolePermissionsTable.permission_id, permission.id),
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
      await db.insert(sysRolePermissionsTable).values(rolePermissions)
    }
  }

  async function getJoinRolePermissions() {
    const rolePermissions = await db
      .select({
        role_id: sysRolePermissionsTable.role_id,
        permission_id: sysRolePermissionsTable.permission_id,
        role_name: sysRoleTable.name,
        permission_action: sysPermissionTable.action,
      })
      .from(sysRolePermissionsTable)
      .innerJoin(sysRoleTable, eq(sysRolePermissionsTable.role_id, sysRoleTable.id))
      .innerJoin(sysPermissionTable, eq(sysRolePermissionsTable.permission_id, sysPermissionTable.id))

    return rolePermissions
  }

  

  return { getRolePermissions, getJoinRolePermissions, syncRolesPermissions }
}

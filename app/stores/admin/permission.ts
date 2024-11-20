import type { InferSelectModel } from 'drizzle-orm'
import type { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'
import type { RolePermission } from './role'

export type Permission = InferSelectModel<typeof sysPermissionTable>

export interface PermissionWithRelations extends Permission {
  rolePermission: RolePermission[]
}

export const usePermissionStore = defineStore('permission', () => {
  async function fetchPermissions(options?: { page: number, limit: number, keyword: string }) {
    return $api<{ total: number, data: Permission[] }>('/permissions', {
      query: options,
    })
  }

  async function fetchPermissionDetail(permissionId: string) {
    return $api(`/permissions/${permissionId}`, {
      method: 'GET',
    })
  }

  async function createPermission(body: Permission) {
    return $api('/permissions', {
      method: 'POST',
      body: omit(body, ['id']),
    })
  }

  async function updatePermission(permissionId: string, body: Partial<Permission>) {
    return $api(`/permissions/${permissionId}`, {
      method: 'PATCH',
      body,
    })
  }

  async function deletePermission(permissionId: string) {
    return $api(`/permissions/${permissionId}`, {
      method: 'DELETE',
    })
  }

  return {
    fetchPermissions,
    fetchPermissionDetail,
    createPermission,
    updatePermission,
    deletePermission,
  }
})

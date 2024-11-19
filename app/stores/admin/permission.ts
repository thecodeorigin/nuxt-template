import type { InferSelectModel } from 'drizzle-orm'
import type { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'
import type { RolePermission } from './role'

export type Permission = InferSelectModel<typeof sysPermissionTable>

export interface PermissionWithRelations extends Permission {
  rolePermission: RolePermission[]
}

export const usePermissionStore = defineStore('permission', () => {
  async function fetchPermissions(options?: { page: number, limit: number, keyword: string }) {
    try {
      return $api<{ total: number, data: Permission[] }>('/permissions', {
        query: options,
      })
    }
    catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  async function fetchPermissionDetail(permissionId: string) {
    try {
      return $api(`/permissions/${permissionId}`, {
        method: 'GET',
      })
    }
    catch (error) {
      console.error('Error fetching permission detail:', error)
    }
  }

  async function createPermission(body: Permission) {
    try {
      return $api('/permissions', {
        method: 'POST',
        body: omit(body, ['id']),
      })
    }
    catch (error) {
      console.error('Error creating permission:', error)
    }
  }

  async function updatePermission(permissionId: string, body: Partial<Permission>) {
    try {
      return $api(`/permissions/${permissionId}`, {
        method: 'PATCH',
        body,
      })
    }
    catch (error) {
      console.error('Error updating permission:', error)
    }
  }

  async function deletePermission(permissionId: string) {
    try {
      return $api(`/permissions/${permissionId}`, {
        method: 'DELETE',
      })
    }
    catch (error) {
      console.error('Error deleting permission:', error)
    }
  }

  return {
    fetchPermissions,
    fetchPermissionDetail,
    createPermission,
    updatePermission,
    deletePermission,
  }
})

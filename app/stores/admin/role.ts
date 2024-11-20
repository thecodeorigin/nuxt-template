import type { InferSelectModel } from 'drizzle-orm'
import type { sysRoleTable } from '@base/server/db/schemas/sys_roles.schema'
import type { ParsedFilterQuery } from '@base/server/utils/filter'
import type { sysRolePermissionTable } from '@base/server/db/schemas'
import type { Permission } from './permission'

export type Role = InferSelectModel<typeof sysRoleTable>

export type RolePermission = InferSelectModel<typeof sysRolePermissionTable>

export type RoleWithPermissions = Role & {
  permissions: Array<{
    permission: Pick<Permission, 'id' | 'subject' | 'action'>
  }>
}

export interface PivotRolePermission extends Partial<Role> {
  permissions: Permission[]
}

export const useRoleStore = defineStore('role', () => {
  async function fetchRoles(options?: ParsedFilterQuery) {
    try {
      return await $api<{ total: number, data: RoleWithPermissions[] }>('/roles', {
        query: options,
      })
    }
    catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  async function fetchRoleDetail(roleId: string) {
    try {
      return await $api(`/roles/${roleId}`, {
        method: 'GET',
      })
    }
    catch (error) {
      console.error('Error fetching role detail:', error)
    }
  }

  async function createRole(body: { id: string, name: string, permissions: string[] }) {
    try {
      return await $api<Role>('/roles', {
        method: 'POST',
        body: omit(body, ['id']),
      })
    }
    catch (error) {
      console.error('Error creating role:', error)
    }
  }

  async function updateRole(roleId: string, body: { id: string, name: string, permissions: string[] }) {
    try {
      return await $api(`/roles/${roleId}`, {
        method: 'PATCH',
        body,
      })
    }
    catch (error) {
      console.error('Error updating role:', error)
    }
  }

  async function deleteRole(roleId: string) {
    try {
      return await $api(`/roles/${roleId}`, {
        method: 'DELETE',
      })
    }
    catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  return {
    fetchRoles,
    fetchRoleDetail,
    createRole,
    updateRole,
    deleteRole,
  }
})

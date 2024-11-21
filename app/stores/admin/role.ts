import type { sysRolePermissionTable } from '@base/server/db/schemas'
import type { sysRoleTable } from '@base/server/db/schemas/sys_roles.schema'
import type { ParsedFilterQuery } from '@base/server/utils/filter'
import type { InferSelectModel } from 'drizzle-orm'
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
    return await $api<{ total: number, data: RoleWithPermissions[] }>('/roles', {
      query: options,
    })
  }

  async function fetchRoleDetail(roleId: string) {
    return await $api(`/roles/${roleId}`, {
      method: 'GET',
    })
  }

  async function createRole(body: { name: string, permissions: string[] }) {
    return await $api<Role>('/roles', {
      method: 'POST',
      body,
    })
  }

  async function updateRole(roleId: string, body: { id: string, name: string, permissions: string[] }) {
    return await $api(`/roles/${roleId}`, {
      method: 'PATCH',
      body,
    })
  }

  async function deleteRole(roleId: string) {
    return await $api(`/roles/${roleId}`, {
      method: 'DELETE',
    })
  }

  return {
    fetchRoles,
    fetchRoleDetail,
    createRole,
    updateRole,
    deleteRole,
  }
})

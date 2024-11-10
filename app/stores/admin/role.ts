import type { InferSelectModel } from 'drizzle-orm'
import type { sysRoleTable } from '@base/server/db/schemas/sys_roles.schema'
import type { ParsedFilterQuery } from '@base/server/utils/filter'

export type Role = InferSelectModel<typeof sysRoleTable>

export const useRoleStore = defineStore('role', () => {
  const roleList = ref<Role[]>([])
  const totalRoles = ref<number>(0)
  const roleDetail = ref<Role | null>(null)

  async function fetchRoles(options?: ParsedFilterQuery) {
    try {
      const response = await $api('/api/roles', {
        query: options,
      })

      roleList.value = response.data
      totalRoles.value = response.total
    }
    catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  async function fetchRoleDetail(roleId: string) {
    try {
      const response = await $api(`/api/roles/${roleId}`, {
        method: 'GET',
      })

      roleDetail.value = response.data
    }
    catch (error) {
      console.error('Error fetching role detail:', error)
    }
  }

  async function createRole(body: Partial<Role>) {
    try {
      const response = await $api<Role>('/api/roles', {
        method: 'POST',
        body,
      })

      return response
    }
    catch (error) {
      console.error('Error creating role:', error)
    }
  }

  async function updateRole(roleId: string, body: Partial<Role>) {
    try {
      const response = await $api(`/api/roles/${roleId}`, {
        method: 'PATCH',
        body,
      })

      return response
    }
    catch (error) {
      console.error('Error updating role:', error)
    }
  }

  async function deleteRole(roleId: string) {
    try {
      await $api(`/api/roles/${roleId}`, {
        method: 'DELETE',
      })
    }
    catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  return {
    roleList,
    totalRoles,
    roleDetail,
    fetchRoles,
    fetchRoleDetail,
    createRole,
    updateRole,
    deleteRole,
  }
})

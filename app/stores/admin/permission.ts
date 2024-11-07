import type { InferSelectModel } from 'drizzle-orm'
import type { ParsedFilterQuery } from '@base/server/utils/filter'
import type { sysPermissionTable } from '@base/server/db/schemas/sys_permissions.schema'

export type Permission = InferSelectModel<typeof sysPermissionTable>

export const usePermissionStore = defineStore('permission', () => {
  const permissionList = ref<Permission[]>([])
  const totalPermissions = ref(0)
  const permissionDetail = ref<Permission | null>(null)

  async function fetchPermissions(options?: ParsedFilterQuery) {
    try {
      const response = await $api('/api/permissions', {
        query: options,
      })

      permissionList.value = response.data
      totalPermissions.value = response.total
    }
    catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  async function fetchPermissionDetail(permissionId: string) {
    try {
      const response = await $api(`/api/permissions/${permissionId}`, {
        method: 'GET',
      })

      permissionDetail.value = response.data
    }
    catch (error) {
      console.error('Error fetching permission detail:', error)
    }
  }

  async function createPermission(body: Partial<Permission>) {
    try {
      const response = await $api('/api/permissions', {
        method: 'POST',
        body,
      })

      return response
    }
    catch (error) {
      console.error('Error creating permission:', error)
    }
  }

  return {
    permissionList,
    permissionDetail,
    totalPermissions,
    fetchPermissions,
    fetchPermissionDetail,
    createPermission,
  }
})

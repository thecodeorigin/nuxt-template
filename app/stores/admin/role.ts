import type { InferSelectModel } from 'drizzle-orm'
import type { sysRoleTable } from '@base/server/db/schemas/sys_roles.schema'
import type { ParsedFilterQuery } from '@base/server/utils/filter'

export type Role = InferSelectModel<typeof sysRoleTable>

export const useRoleStore = defineStore('role', () => {
  const roleList = ref<Role[]>([])

  async function fetchRoles(options?: ParsedFilterQuery) {
    try {
      const response = await $api<Role[]>('/api/roles', {
        query: options,
      })

      roleList.value = response
    }
    catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  return {
    roleList,
    fetchRoles,
  }
})

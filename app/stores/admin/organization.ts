import type { sysOrganizationTable } from '@base/server/db/schemas/sys_organizations.schema'
import type { InferSelectModel } from 'drizzle-orm'
import type { ParsedFilterQuery } from '@base/server/utils/filter'

export type Organization = InferSelectModel<typeof sysOrganizationTable>

export const useOrganizationStore = defineStore('organization', () => {
  const organizationList = ref<Organization[]>([])
  const totalOrganizations = ref<number>(0)
  const organizationDetail = ref<Organization | null>(null)

  async function fetchOrganizations(options?: ParsedFilterQuery) {
    try {
      const response = await $api<Organization[]>('/api/organizations', {
        query: options,
      })

      if (response) {
        organizationList.value = response.data
        totalOrganizations.value = response.total
      }
    }
    catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }

  async function fetchOrganizationDetail(organizationId: string) {
    try {
      const response = await $api<Organization>(`/api/organizations/${organizationId}`, {
        method: 'GET',
      })

      organizationDetail.value = response.data
    }
    catch (error) {
      console.error('Error fetching organization detail:', error)
    }
  }

  async function createOrganization(body: Partial<Organization>) {
    try {
      const response = await $api<Organization>('/api/organizations', {
        method: 'POST',
        body,
      })

      return response
    }
    catch (error) {
      console.error('Error creating organization:', error)
    }
  }

  async function updateOrganization(organizationId: string, body: Partial<Organization>) {
    try {
      const response = await $api<Organization>(`/api/organizations/${organizationId}`, {
        method: 'PATCH',
        body,
      })

      return response
    }
    catch (error) {
      console.error('Error updating organization:', error)
    }
  }

  async function deleteOrganization(organizationId: string) {
    try {
      await $api(`/api/organizations/${organizationId}`, {
        method: 'DELETE',
      })
    }
    catch (error) {
      console.error('Error deleting organization:', error)
    }
  }

  return {
    organizationList,
    organizationDetail,
    totalOrganizations,
    fetchOrganizations,
    fetchOrganizationDetail,
    updateOrganization,
    createOrganization,
    deleteOrganization,
  }
})

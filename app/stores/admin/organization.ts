import type { sysOrganizationTable } from '@base/server/db/schemas'
import type { ParsedFilterQuery } from '@base/server/utils/filter'
import type { InferSelectModel } from 'drizzle-orm'

export type Organization = InferSelectModel<typeof sysOrganizationTable>

export const useOrganizationStore = defineStore('organization', () => {
  async function fetchOrganizations(options?: ParsedFilterQuery) {
    return $api<{ total: number, data: Organization[] }>('/organizations', {
      query: options,
    })
  }

  async function fetchOrganizationDetail(organizationId: string) {
    return $api<{ data: Organization }>(`/organizations/${organizationId}`)
  }

  async function createOrganization(body: Partial<Organization>) {
    return await $api<{ data: Organization }>('/organizations', {
      method: 'POST',
      body,
    })
  }

  async function updateOrganization(organizationId: string, body: Partial<Organization>) {
    return await $api<{ data: Organization }>(`/organizations/${organizationId}`, {
      method: 'PATCH',
      body,
    })
  }

  async function deleteOrganization(organizationId: string) {
    return await $api(`/organizations/${organizationId}`, {
      method: 'DELETE',
    })
  }

  return {
    fetchOrganizations,
    fetchOrganizationDetail,
    updateOrganization,
    createOrganization,
    deleteOrganization,
  }
})

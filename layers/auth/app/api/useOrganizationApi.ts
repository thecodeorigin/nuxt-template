import type { AddMember, UpdateMemberAbilities } from '#layers/auth/shared/schemas/member'
import type { SwitchOrganization, UpdateOrganization } from '#layers/auth/shared/schemas/organization'
import type { ExtractResponse } from '~/types/utils'

export function useOrganizationApi() {
  function fetchOrganizations() {
    return $http('/api/organizations')
  }

  function fetchOrganization() {
    return $http('/api/organization')
  }

  function updateOrganization(input: UpdateOrganization) {
    return $http('/api/organization', { method: 'PATCH', body: input })
  }

  function switchOrganization(input: SwitchOrganization) {
    return $http('/api/organizations/switch', { method: 'POST', body: input })
  }

  function refreshSession() {
    return $http('/api/session/refresh', { method: 'POST' })
  }

  function fetchMembers() {
    return $http('/api/organization/members')
  }

  function addMember(input: AddMember) {
    return $http('/api/organization/members', { method: 'POST', body: input })
  }

  function fetchPermissions() {
    return $http('/api/permissions')
  }

  function updateMemberAbilities(userId: string, input: UpdateMemberAbilities) {
    return $http('/api/organization/members/:userId/abilities', { method: 'PATCH', body: input, query: { userId } })
  }

  function removeMember(userId: string) {
    return $http('/api/organization/members/:userId', { method: 'DELETE', query: { userId } })
  }

  function deleteAccount() {
    return $http('/api/account', { method: 'DELETE' })
  }

  return { fetchOrganizations, fetchOrganization, updateOrganization, switchOrganization, refreshSession, fetchMembers, addMember, fetchPermissions, updateMemberAbilities, removeMember, deleteAccount }
}

export type OrganizationSummary = NonNullable<ExtractResponse<typeof useOrganizationApi, 'fetchOrganizations'>>[number]
export type OrgMember = NonNullable<ExtractResponse<typeof useOrganizationApi, 'fetchMembers'>>[number]
export type CatalogPermission = NonNullable<ExtractResponse<typeof useOrganizationApi, 'fetchPermissions'>>[number]

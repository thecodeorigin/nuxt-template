import type { Role } from '@nuxthub/db/schema'
import type { ListQuery, Page } from '~~/shared/schemas/pagination'
import type { CreateInvitation } from '#layers/auth/shared/schemas/invitation'
import type { AddMember, UpdateMemberAbilities } from '#layers/auth/shared/schemas/member'
import type { CreateOrganization, SwitchOrganization, UpdateOrganization } from '#layers/auth/shared/schemas/organization'
import type { ExtractResponse } from '~/types/utils'

export function useOrganizationApi() {
  function fetchOrganizations(query?: Partial<ListQuery>) {
    return $http<Page<{ id: string, name: string, slug: string, is_personal: boolean | null }>>('/api/organizations', { query })
  }

  function createOrganization(input: CreateOrganization) {
    return $http('/api/organizations', { method: 'POST', body: input })
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

  function fetchMembers(query?: Partial<ListQuery>) {
    return $http<Page<{ id: string, name: string | null, username: string | null, primary_email: string, avatar: string | null, abilities: string[] | null, is_suspended: boolean | null }>>('/api/organization/members', { query })
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

  function fetchInvitations() {
    return $http('/api/organization/invitations')
  }

  function createInvitation(input: CreateInvitation) {
    return $http('/api/organization/invitations', { method: 'POST', body: input })
  }

  function revokeInvitation(invId: string) {
    return $http('/api/organization/invitations/:id', { method: 'DELETE', query: { id: invId } })
  }

  function fetchInvitation(token: string) {
    return $http('/api/invitations/:token', { query: { token } })
  }

  function acceptInvitation(token: string) {
    return $http('/api/invitations/:token/accept', { method: 'POST', query: { token } })
  }

  function fetchRoles() {
    return $http<Role[]>('/api/roles')
  }

  function createRole(data: { name: string, description?: string, permissions: string[] }) {
    return $http<Role>('/api/roles', { method: 'POST', body: data })
  }

  function updateRole(id: string, data: Partial<{ name: string, description?: string, permissions: string[] }>) {
    return $http<Role>(`/api/roles/${id}`, { method: 'PATCH', body: data })
  }

  function deleteRole(id: string) {
    return $http(`/api/roles/${id}`, { method: 'DELETE' })
  }

  function assignMemberRoles(userId: string, roleIds: string[]) {
    return $http(`/api/organization/members/${userId}/roles`, { method: 'PATCH', body: { role_ids: roleIds } })
  }

  function deleteAccount() {
    return $http('/api/account', { method: 'DELETE' })
  }

  return { fetchOrganizations, createOrganization, fetchOrganization, updateOrganization, switchOrganization, refreshSession, fetchMembers, addMember, fetchPermissions, updateMemberAbilities, removeMember, fetchInvitations, createInvitation, revokeInvitation, fetchInvitation, acceptInvitation, fetchRoles, createRole, updateRole, deleteRole, assignMemberRoles, deleteAccount }
}

export type OrganizationSummary = NonNullable<Awaited<ReturnType<ReturnType<typeof useOrganizationApi>['fetchOrganizations']>>>['items'][number]
export type OrgMember = NonNullable<Awaited<ReturnType<ReturnType<typeof useOrganizationApi>['fetchMembers']>>>['items'][number]
export type CatalogPermission = NonNullable<ExtractResponse<typeof useOrganizationApi, 'fetchPermissions'>>[number]
export type OrgInvitation = NonNullable<ExtractResponse<typeof useOrganizationApi, 'fetchInvitations'>>[number]

import type { InjectionKey, Ref } from 'vue'
import type { CatalogPermission, OrgInvitation } from '#layers/auth/app/api/useOrganizationApi'

export interface MembersContext {
  invitations: Ref<OrgInvitation[]>
  permissions: Ref<CatalogPermission[]>
  addMember: (email: string) => Promise<void>
  updateMemberAbilities: (userId: string, abilities: string[]) => Promise<void>
  removeMember: (userId: string) => Promise<void>
  createInvitation: (email: string, roleId?: string, metadata?: Record<string, unknown>) => Promise<OrgInvitation>
  revokeInvitation: (invId: string) => Promise<void>
}

export const membersKey: InjectionKey<MembersContext> = Symbol('org-members')

export function useOrganizationMembers() {
  const ctx = inject(membersKey)
  if (!ctx)
    throw new Error('useOrganizationMembers() must be called within the members page')
  return ctx
}

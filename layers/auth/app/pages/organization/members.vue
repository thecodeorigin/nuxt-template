<script setup lang="ts">
import type { CatalogPermission, OrgInvitation } from '#layers/auth/app/api/useOrganizationApi'
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'
import OrganizationMemberList from '#layers/auth/app/components/Organization/OrganizationMemberList.vue'
import { membersKey } from '#layers/auth/app/composables/useOrganizationMembers'

definePageMeta({ can: ['user:read'] })
useHead({ title: 'Members' })

const orgApi = useOrganizationApi()
const { data: permissions } = useAsyncData('org-permissions', () => orgApi.fetchPermissions(), { default: (): CatalogPermission[] => [] })
const { data: invitations } = useAsyncData('org-invitations', () => orgApi.fetchInvitations(), { default: (): OrgInvitation[] => [] })

provide(membersKey, {
  invitations,
  permissions,
  async addMember(email) {
    await orgApi.addMember({ email })
  },
  async updateMemberAbilities(userId, abilities) {
    await orgApi.updateMemberAbilities(userId, { abilities })
  },
  async removeMember(userId) {
    await orgApi.removeMember(userId)
  },
  async createInvitation(email, roleId, projectIds) {
    const inv = await orgApi.createInvitation({ email, role_id: roleId, project_ids: projectIds?.length ? projectIds : undefined })
    invitations.value = [...invitations.value, inv]
    return inv
  },
  async revokeInvitation(invId) {
    await orgApi.revokeInvitation(invId)
    invitations.value = invitations.value.filter(i => i.id !== invId)
  },
})
</script>

<template>
  <div class="space-y-4">
    <UAlert
      icon="i-lucide-info"
      color="neutral"
      variant="subtle"
      title="Permission changes apply to this organization and take effect immediately."
    />
    <OrganizationMemberList />
  </div>
</template>

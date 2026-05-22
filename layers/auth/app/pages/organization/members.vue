<script setup lang="ts">
import type { CatalogPermission, OrgMember } from '#layers/auth/app/api/useOrganizationApi'
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'
import OrganizationMemberList from '#layers/auth/app/components/Organization/OrganizationMemberList.vue'
import { membersKey } from '#layers/auth/app/composables/useOrganizationMembers'

definePageMeta({ can: ['user:read'] })
useHead({ title: 'Members' })

const orgApi = useOrganizationApi()
const { data: members, error } = useAsyncData('org-members', () => orgApi.fetchMembers(), { default: (): OrgMember[] => [] })
const { data: permissions } = useAsyncData('org-permissions', () => orgApi.fetchPermissions(), { default: (): CatalogPermission[] => [] })
whenError(error)

provide(membersKey, {
  members,
  permissions,
  async addMember(email) {
    const newMember = await orgApi.addMember({ email })
    members.value = [...members.value, newMember]
  },
  async updateMemberAbilities(userId, abilities) {
    const updated = await orgApi.updateMemberAbilities(userId, { abilities })
    members.value = members.value.map(m => (m.id === userId ? { ...m, abilities: updated.abilities } : m))
  },
  async removeMember(userId) {
    await orgApi.removeMember(userId)
    members.value = members.value.filter(m => m.id !== userId)
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

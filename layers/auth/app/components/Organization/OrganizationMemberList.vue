<script setup lang="ts">
import type { OrgMember } from '#layers/auth/app/api/useOrganizationApi'
import OrganizationAddMemberModal from '#layers/auth/app/components/Organization/OrganizationAddMemberModal.vue'
import OrganizationMemberPermissionsModal from '#layers/auth/app/components/Organization/OrganizationMemberPermissionsModal.vue'
import { useOrganizationMembers } from '#layers/auth/app/composables/useOrganizationMembers'
import { satisfiesAbility } from '#layers/auth/shared/ability'

const authStore = useAuthStore()
const toast = useToast()
const { members, removeMember } = useOrganizationMembers()

const canManageUsers = computed(() =>
  satisfiesAbility(authStore.currentUser?.abilities ?? [], 'user:manage'),
)

const editingMember = ref<OrgMember | null>(null)
const showEditModal = ref(false)
const removing = ref<string | null>(null)
const showAddModal = ref(false)

async function handleRemove(member: OrgMember) {
  removing.value = member.id
  try {
    await removeMember(member.id)
    toast.add({ title: `${member.name ?? member.primary_email} removed`, color: 'success' })
  }
  catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Failed to remove member', description: error?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    removing.value = null
  }
}
</script>

<template>
  <UCard>
    <div v-if="canManageUsers" class="flex justify-end mb-4">
      <UButton
        icon="i-lucide-user-plus"
        label="Add member"
        size="sm"
        @click="showAddModal = true"
      />
    </div>

    <div v-if="members.length === 0" class="text-center text-muted py-8">
      No members in this organization.
    </div>
    <ul v-else class="divide-y divide-default">
      <li
        v-for="member in members"
        :key="member.id"
        class="flex items-center gap-3 py-3"
      >
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">
            {{ member.name ?? member.username ?? member.primary_email }}
          </p>
          <p class="text-xs text-muted truncate">
            {{ member.primary_email }}
          </p>
          <div class="flex flex-wrap gap-1 mt-1">
            <UBadge
              v-for="ability in member.abilities.filter((a: string) => !a.endsWith(':self'))"
              :key="ability"
              :label="ability"
              color="neutral"
              variant="subtle"
              size="xs"
            />
          </div>
        </div>

        <div v-if="canManageUsers && member.id !== authStore.currentUser?.id" class="flex gap-2 shrink-0">
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="() => { editingMember = member; showEditModal = true }"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            :loading="removing === member.id"
            @click="handleRemove(member)"
          />
        </div>
      </li>
    </ul>
  </UCard>

  <OrganizationMemberPermissionsModal
    v-model:open="showEditModal"
    :member="editingMember"
    @update:open="(v) => { if (!v) editingMember = null }"
  />

  <OrganizationAddMemberModal v-model:open="showAddModal" />
</template>

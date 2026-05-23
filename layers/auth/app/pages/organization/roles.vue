<script setup lang="ts">
import type { Role } from '#layers/auth/server/db/schema'
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'
import OrganizationRoleModal from '#layers/auth/app/components/Organization/OrganizationRoleModal.vue'

definePageMeta({ can: ['user:read'] })
useHead({ title: 'Roles' })

const orgApi = useOrganizationApi()
const toast = useToast()
const { data: roles, refresh, error } = useAsyncData('org-roles', () => orgApi.fetchRoles(), { default: (): Role[] => [] })
whenError(error)

const modalOpen = ref(false)
const editingRole = ref<Role | null>(null)

function openCreate() {
  editingRole.value = null
  modalOpen.value = true
}

function openEdit(role: Role) {
  editingRole.value = role
  modalOpen.value = true
}

async function handleDeleteRole(id: string) {
  try {
    await orgApi.deleteRole(id)
    await refresh()
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Failed to delete role', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
}
</script>

<template>
  <div>
    <UPageCard title="Roles" description="Manage roles and their permissions." variant="naked" orientation="horizontal" class="mb-4">
      <UButton label="New role" icon="i-lucide-plus" class="w-fit lg:ms-auto" @click="openCreate" />
    </UPageCard>
    <UPageCard variant="subtle">
      <div v-if="!roles.length" class="text-center py-8 text-muted text-sm">
        No custom roles yet.
      </div>
      <div v-else class="divide-y divide-default">
        <div v-for="role in roles" :key="role.id" class="flex items-center justify-between py-3 gap-4">
          <div>
            <p class="font-medium">
              {{ role.name }}
            </p>
            <p v-if="role.description" class="text-sm text-muted">
              {{ role.description }}
            </p>
            <p class="text-xs text-dimmed">
              {{ role.permissions.length }} permission{{ role.permissions.length !== 1 ? 's' : '' }}
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-pencil" @click="openEdit(role)" />
            <UButton v-if="!role.is_system" size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" @click="handleDeleteRole(role.id)" />
          </div>
        </div>
      </div>
    </UPageCard>
    <OrganizationRoleModal v-model:open="modalOpen" :role="editingRole" @saved="refresh()" />
  </div>
</template>

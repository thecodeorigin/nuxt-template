<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ExpandedState } from '@tanstack/vue-table'
import type { OrgInvitation, OrgMember } from '#layers/auth/app/api/useOrganizationApi'
import { h, resolveComponent } from 'vue'
import OrganizationAddMemberModal from '#layers/auth/app/components/Organization/OrganizationAddMemberModal.vue'
import OrganizationMemberPermissionsModal from '#layers/auth/app/components/Organization/OrganizationMemberPermissionsModal.vue'
import { useOrganizationMembers } from '#layers/auth/app/composables/useOrganizationMembers'
import { satisfiesAbility } from '#layers/auth/shared/ability'

const authStore = useAuthStore()
const toast = useToast()
const { members, invitations, removeMember, createInvitation, revokeInvitation } = useOrganizationMembers()

const canManageUsers = computed(() =>
  satisfiesAbility(authStore.currentUser?.abilities ?? [], 'user:manage'),
)

// --- Invite by link ---
const inviteEmail = ref('')
const inviteRole = ref<'member' | 'admin'>('member')
const inviting = ref(false)
const generatedLink = ref('')

const roleOptions = [
  { label: 'Member', value: 'member' },
  { label: 'Admin', value: 'admin' },
]

function joinLink(token: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/join/${token}`
}

async function generateInvitation() {
  if (!inviteEmail.value.trim())
    return
  inviting.value = true
  generatedLink.value = ''
  try {
    const inv = await createInvitation(inviteEmail.value.trim(), inviteRole.value)
    generatedLink.value = joinLink(inv.token)
    inviteEmail.value = ''
    inviteRole.value = 'member'
  }
  catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Failed to create invitation', description: error?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    inviting.value = false
  }
}

async function copyLink(link: string) {
  await navigator.clipboard.writeText(link)
  toast.add({ title: 'Invitation link copied', color: 'success' })
}

async function handleRevokeInvitation(id: string) {
  try {
    await revokeInvitation(id)
    toast.add({ title: 'Invitation revoked', color: 'success' })
  }
  catch {
    toast.add({ title: 'Failed to revoke invitation', color: 'error' })
  }
}

const invitationColumns: TableColumn<OrgInvitation>[] = [
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => row.original.role.charAt(0).toUpperCase() + row.original.role.slice(1),
  },
  {
    id: 'link',
    header: 'Invitation link',
    cell: ({ row }) => {
      const UButton = resolveComponent('UButton')
      const UInput = resolveComponent('UInput')
      const link = joinLink(row.original.token)
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UInput, { 'modelValue': link, 'type': 'password', 'readonly': true, 'size': 'xs', 'class': 'flex-1 font-mono', 'aria-label': 'Invitation link' }),
        h(UButton, { 'icon': 'i-lucide-copy', 'color': 'neutral', 'variant': 'ghost', 'size': 'xs', 'aria-label': 'Copy link', 'onClick': () => copyLink(link) }),
      ])
    },
  },
  {
    id: 'actions',
    header: '',
    meta: { class: { td: 'text-right' } },
    cell: ({ row }) => {
      if (!canManageUsers.value)
        return null
      const UButton = resolveComponent('UButton')
      return h(UButton, { label: 'Revoke', color: 'error', variant: 'subtle', size: 'xs', onClick: () => handleRevokeInvitation(row.original.id) })
    },
  },
]

// --- Members ---
const editingMember = ref<OrgMember | null>(null)
const showEditModal = ref(false)
const showAddModal = ref(false)
const removing = ref<string | null>(null)
const expanded = ref<ExpandedState>({})

const memberColumns: TableColumn<OrgMember>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => h('div', [
      h('p', { class: 'font-medium' }, row.original.name ?? row.original.username ?? row.original.primary_email),
      h('p', { class: 'text-xs text-muted' }, row.original.primary_email),
    ]),
  },
  {
    id: 'abilities',
    header: 'Abilities',
    cell: ({ row }) => {
      const UBadge = resolveComponent('UBadge')
      return h('div', { class: 'flex flex-wrap gap-1' }, row.original.abilities
        .filter((a: string) => !a.endsWith(':self'))
        .map((a: string) => h(UBadge, { label: a, color: 'neutral', variant: 'subtle' })))
    },
  },
  {
    id: 'actions',
    header: '',
    meta: { class: { td: 'text-right' } },
    cell: ({ row }) => {
      if (!canManageUsers.value || row.original.id === authStore.currentUser?.id)
        return null
      const UButton = resolveComponent('UButton')
      return h('div', { class: 'flex gap-2 justify-end' }, [
        h(UButton, {
          'icon': 'i-lucide-pencil',
          'color': 'neutral',
          'variant': 'ghost',
          'size': 'xs',
          'aria-label': 'Edit permissions',
          'onClick': () => {
            editingMember.value = row.original
            showEditModal.value = true
          },
        }),
        h(UButton, {
          'icon': 'i-lucide-trash-2',
          'color': 'error',
          'variant': 'ghost',
          'size': 'xs',
          'aria-label': 'Remove member',
          'loading': removing.value === row.original.id,
          'onClick': () => handleRemove(row.original),
        }),
      ])
    },
  },
]

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
  <div class="space-y-6">
    <!-- Invite by link -->
    <div v-if="canManageUsers" class="space-y-3">
      <p class="font-semibold">
        Invite a member
      </p>
      <UCard>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <UFormField label="Email" class="flex-1">
            <UInput
              v-model="inviteEmail"
              type="email"
              placeholder="user@example.com"
              class="w-full"
              @keydown.enter="generateInvitation"
            />
          </UFormField>
          <UFormField label="Role">
            <USelect v-model="inviteRole" :items="roleOptions" value-key="value" label-key="label" />
          </UFormField>
          <UButton
            label="Generate invite link"
            icon="i-lucide-link"
            :loading="inviting"
            :disabled="!inviteEmail.trim()"
            @click="generateInvitation"
          />
          <UButton
            label="Add existing"
            icon="i-lucide-user-plus"
            color="neutral"
            variant="subtle"
            @click="showAddModal = true"
          />
        </div>

        <div v-if="generatedLink" class="mt-3 flex items-center gap-2">
          <UInput :model-value="generatedLink" type="password" readonly class="flex-1 font-mono text-xs" aria-label="Generated invitation link" />
          <UButton icon="i-lucide-copy" color="neutral" variant="ghost" aria-label="Copy link" @click="copyLink(generatedLink)" />
        </div>
      </UCard>
    </div>

    <!-- Pending invitations -->
    <div v-if="invitations.length > 0" class="space-y-3">
      <p class="font-semibold">
        Pending invitations
      </p>
      <UCard :ui="{ body: 'sm:p-0' }">
        <UTable :columns="invitationColumns" :data="invitations" />
      </UCard>
    </div>

    <!-- Members -->
    <div class="space-y-3">
      <p class="font-semibold">
        Members
      </p>
      <UCard :ui="{ body: 'sm:p-0' }">
        <UTable
          v-model:expanded="expanded"
          :columns="memberColumns"
          :data="members"
        >
          <template #empty>
            <div class="text-center text-muted py-8">
              No members in this organization.
            </div>
          </template>

          <template #expanded="{ row }">
            <div class="p-4 space-y-1">
              <p class="text-xs font-semibold text-muted mb-2">
                All permissions
              </p>
              <div class="flex flex-wrap gap-1.5">
                <UBadge
                  v-for="ability in row.original.abilities"
                  :key="ability"
                  :label="ability"
                  color="primary"
                  variant="subtle"
                  size="sm"
                />
              </div>
            </div>
          </template>
        </UTable>
      </UCard>
    </div>
  </div>

  <OrganizationMemberPermissionsModal
    v-model:open="showEditModal"
    :member="editingMember"
    @update:open="(v) => { if (!v) editingMember = null }"
  />

  <OrganizationAddMemberModal v-model:open="showAddModal" />
</template>

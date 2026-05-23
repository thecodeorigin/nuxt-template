<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ExpandedState } from '@tanstack/vue-table'
import type { OrgMember } from '#layers/auth/app/api/useOrganizationApi'
import { h, resolveComponent } from 'vue'
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'
import OrganizationMemberPermissionsModal from '#layers/auth/app/components/Organization/OrganizationMemberPermissionsModal.vue'
import { useOrganizationMembers } from '#layers/auth/app/composables/useOrganizationMembers'
import { satisfiesAbility } from '#layers/auth/shared/ability'
import { whenError } from '~/utils/error'

const authStore = useAuthStore()
const toast = useToast()
const orgApi = useOrganizationApi()
const { invitations, removeMember, createInvitation, revokeInvitation } = useOrganizationMembers()

const canManageUsers = computed(() =>
  satisfiesAbility(authStore.currentUser?.abilities ?? [], 'user:manage'),
)

const scrollEl = ref<HTMLElement | null>(null)
const { items: members, q, hasMore, loading, loadMore, reset } = useInfiniteList(
  opts => orgApi.fetchMembers(opts).then(p => p),
  { immediate: true },
)

useInfiniteScroll(scrollEl, loadMore, { distance: 120, canLoadMore: () => hasMore.value })

// --- Invite by link ---
const inviteEmail = ref('')
const inviteRoleId = ref('')
const inviting = ref(false)
const generatedLink = ref('')

const { data: orgRoles, error: rolesError } = useAsyncData('org-roles', () => orgApi.fetchRoles(), { default: () => [] })
whenError(rolesError)

const roleOptions = computed(() => [
  { label: 'Default', value: '' },
  ...orgRoles.value.map(r => ({ label: r.name, value: r.id })),
])

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
    const inv = await createInvitation(inviteEmail.value.trim(), inviteRoleId.value || undefined)
    generatedLink.value = joinLink(inv.token)
    inviteEmail.value = ''
    inviteRoleId.value = ''
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

type OrgInvitation = typeof invitations extends Ref<infer U> ? (U extends Array<infer V> ? V : never) : never

const invitationColumns: TableColumn<OrgInvitation>[] = [
  { accessorKey: 'email', header: 'Email' },
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
      return h('div', { class: 'flex flex-wrap gap-1' }, (row.original.abilities ?? [])
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
    reset()
    await loadMore()
  }
  catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Failed to remove member', description: error?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    removing.value = null
  }
}

watch(showEditModal, async (open) => {
  if (!open) {
    reset()
    await loadMore()
  }
})
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
            <USelect v-model="inviteRoleId" :items="roleOptions" value-key="value" label-key="label" class="min-w-40" />
          </UFormField>
          <UButton
            label="Generate invite link"
            icon="i-lucide-link"
            :loading="inviting"
            :disabled="!inviteEmail.trim()"
            @click="generateInvitation"
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
      <div class="flex items-center gap-3">
        <p class="font-semibold flex-1">
          Members
        </p>
        <UInput
          v-model="q"
          icon="i-lucide-search"
          placeholder="Search members…"
          size="sm"
          class="w-56"
        />
      </div>
      <UCard :ui="{ body: 'sm:p-0' }">
        <div ref="scrollEl">
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
          <div v-if="loading" class="py-3 text-center text-muted text-sm">
            Loading…
          </div>
        </div>
      </UCard>
    </div>
  </div>

  <OrganizationMemberPermissionsModal
    v-model:open="showEditModal"
    :member="editingMember"
    @update:open="(v) => { if (!v) editingMember = null }"
  />
</template>

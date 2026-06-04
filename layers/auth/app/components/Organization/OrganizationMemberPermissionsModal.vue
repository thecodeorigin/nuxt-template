<script setup lang="ts">
import type { OrgMember } from '#layers/auth/app/api/useOrganizationApi'
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'
import { useOrganizationMembers } from '#layers/auth/app/composables/useOrganizationMembers'
import { whenError } from '~/utils/error'

const props = defineProps<{ member: OrgMember | null }>()
const open = defineModel<boolean>('open', { default: false })

const toast = useToast()
const orgApi = useOrganizationApi()
const { $ability } = useNuxtApp()
const { permissions, updateMemberAbilities } = useOrganizationMembers()

const { data: orgRoles, error: rolesError } = useAsyncData('org-roles', () => orgApi.fetchRoles(), { default: () => [] })
whenError(rolesError)

const selected = ref<string[]>([])
const selectedRoleIds = ref<string[]>([])

watch(() => props.member, (m) => {
  selected.value = m ? (m.abilities ?? []).filter(a => !a.endsWith(':self')) : []
  selectedRoleIds.value = []
}, { immediate: true })

const saving = ref(false)

const grouped = computed(() => {
  const tenantEditable = permissions.value.filter(p => p.scope === null)
  const subjects = [...new Set(tenantEditable.map(p => p.subject))]
  return subjects.map(subject => ({
    subject,
    permissions: tenantEditable.filter(p => p.subject === subject),
  }))
})

const roleOptions = computed(() => orgRoles.value.map(r => ({ label: r.name, value: r.id })))

function canGrant(key: string) {
  const [s = '', a = ''] = key.split(':')
  return $ability.can(a, s)
}

function toggle(key: string) {
  if (!canGrant(key))
    return
  if (selected.value.includes(key))
    selected.value = selected.value.filter(a => a !== key)
  else
    selected.value = [...selected.value, key]
}

async function save() {
  if (!props.member)
    return
  saving.value = true
  try {
    await Promise.all([
      updateMemberAbilities(props.member.id, selected.value),
      orgApi.assignMemberRoles(props.member.id, selectedRoleIds.value),
    ])
    toast.add({ title: 'Permissions updated', color: 'success' })
    open.value = false
  }
  catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Failed to update permissions', description: error?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="member ? `Permissions — ${member.name ?? member.primary_email}` : 'Permissions'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="space-y-4">
        <div v-if="orgRoles.length > 0">
          <p class="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
            Roles
          </p>
          <USelectMenu
            v-model="selectedRoleIds"
            :items="roleOptions"
            value-key="value"
            label-key="label"
            multiple
            placeholder="Select roles…"
          />
        </div>
        <div v-for="group in grouped" :key="group.subject">
          <p class="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
            {{ group.subject }}
          </p>
          <div class="space-y-2">
            <div
              v-for="perm in group.permissions"
              :key="perm.key"
              class="flex items-center justify-between"
            >
              <div>
                <p class="text-sm">
                  {{ perm.description ?? perm.key }}
                </p>
                <p class="text-xs text-muted">
                  {{ perm.key }}
                </p>
              </div>
              <USwitch
                :model-value="selected.includes(perm.key)"
                :disabled="!canGrant(perm.key)"
                @update:model-value="toggle(perm.key)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton color="neutral" variant="ghost" label="Cancel" @click="open = false" />
      <UButton label="Save" :loading="saving" @click="save" />
    </template>
  </UModal>
</template>

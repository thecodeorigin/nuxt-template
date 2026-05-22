<script setup lang="ts">
import type { OrgMember } from '#layers/auth/app/api/useOrganizationApi'
import { useOrganizationMembers } from '#layers/auth/app/composables/useOrganizationMembers'
import { satisfiesAbility } from '#layers/auth/shared/ability'

const props = defineProps<{ member: OrgMember }>()
const emit = defineEmits<{ close: [] }>()

const authStore = useAuthStore()
const toast = useToast()
const { permissions, updateMemberAbilities } = useOrganizationMembers()

// Start with current grants (tenant, non-:self)
const selected = ref<string[]>(
  props.member.abilities.filter(a => !a.endsWith(':self')),
)

const saving = ref(false)

// Group tenant permissions (scope === null only — self defaults aren't toggled)
const grouped = computed(() => {
  const tenantEditable = permissions.value.filter(p => p.scope === null)
  const subjects = [...new Set(tenantEditable.map(p => p.subject))]
  return subjects.map(subject => ({
    subject,
    permissions: tenantEditable.filter(p => p.subject === subject),
  }))
})

function canGrant(key: string) {
  return satisfiesAbility(authStore.currentUser?.abilities ?? [], key)
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
  saving.value = true
  try {
    await updateMemberAbilities(props.member.id, selected.value)
    toast.add({ title: 'Permissions updated', color: 'success' })
    emit('close')
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
  <UModal :title="`Permissions — ${member.name ?? member.primary_email}`" @close="emit('close')">
    <template #body>
      <div class="space-y-4">
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
              <UToggle
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
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="emit('close')" />
        <UButton label="Save" :loading="saving" @click="save" />
      </div>
    </template>
  </UModal>
</template>

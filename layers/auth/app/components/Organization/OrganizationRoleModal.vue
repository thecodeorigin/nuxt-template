<script setup lang="ts">
import type { Role } from '#layers/auth/server/db/schema'
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'
import { buildPermissionCatalog } from '#layers/auth/shared/permissions'

const props = defineProps<{
  open: boolean
  role: Role | null
}>()
const emit = defineEmits<{ 'update:open': [boolean], 'saved': [] }>()

const orgApi = useOrganizationApi()
const toast = useToast()

const catalog = buildPermissionCatalog().filter(p => p.org_kind === 'tenant')

const name = ref('')
const description = ref('')
const permissions = ref<string[]>([])
const saving = ref(false)

watch(() => props.open, (val) => {
  if (val) {
    name.value = props.role?.name ?? ''
    description.value = props.role?.description ?? ''
    permissions.value = props.role?.permissions ? [...props.role.permissions] : []
  }
})

function togglePermission(key: string, checked: boolean) {
  if (checked)
    permissions.value = [...permissions.value, key]
  else
    permissions.value = permissions.value.filter(p => p !== key)
}

async function save() {
  saving.value = true
  try {
    if (props.role) {
      await orgApi.updateRole(props.role.id, { name: name.value, description: description.value || undefined, permissions: permissions.value })
    }
    else {
      await orgApi.createRole({ name: name.value, description: description.value || undefined, permissions: permissions.value })
    }
    toast.add({ title: 'Role saved', color: 'success' })
    emit('saved')
    emit('update:open', false)
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Failed to save role', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal :open="open" :title="role ? `Edit Role — ${role.name}` : 'New Role'" @update:open="emit('update:open', $event)">
    <template #body>
      <div class="space-y-4">
        <UFormField label="Name" required>
          <UInput v-model="name" placeholder="e.g. Editor" :disabled="!!role?.is_system" class="w-full" />
        </UFormField>
        <UFormField label="Description">
          <UInput v-model="description" placeholder="Optional description" class="w-full" />
        </UFormField>
        <UFormField label="Permissions">
          <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            <UCheckbox
              v-for="perm in catalog"
              :key="perm.key"
              :model-value="permissions.includes(perm.key)"
              :label="perm.key"
              @update:model-value="(v: boolean | 'indeterminate') => togglePermission(perm.key, v === true)"
            />
          </div>
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="emit('update:open', false)" />
        <UButton label="Save" :loading="saving" @click="save()" />
      </div>
    </template>
  </UModal>
</template>

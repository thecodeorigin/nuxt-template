<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { OrganizationSummary } from '#layers/auth/app/api/useOrganizationApi'
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'

defineProps<{ collapsed?: boolean }>()

const authStore = useAuthStore()
const orgApi = useOrganizationApi()
const orgs = ref<OrganizationSummary[]>([])
const loaded = ref(false)

async function ensureOrgs() {
  if (loaded.value)
    return
  orgs.value = await orgApi.fetchOrganizations()
  loaded.value = true
}

async function select(id: string) {
  if (id === authStore.activeOrganizationId)
    return
  await authStore.switchOrganization(id)
  if (import.meta.client)
    window.location.reload()
}

const items = computed<DropdownMenuItem[][]>(() => [[
  { type: 'label', label: 'Organizations' },
  ...orgs.value.map(o => ({
    label: o.name,
    icon: o.id === authStore.activeOrganizationId ? 'i-lucide-check' : 'i-lucide-building',
    onSelect: () => { void select(o.id) },
  })),
]])

const activeName = computed(() =>
  orgs.value.find(o => o.id === authStore.activeOrganizationId)?.name ?? 'Organization')

onMounted(() => ensureOrgs())
</script>

<template>
  <UDropdownMenu :items="items" @update:open="(o: boolean) => o && ensureOrgs()">
    <UButton
      :label="collapsed ? undefined : activeName"
      icon="i-lucide-building"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{ trailingIcon: 'text-dimmed' }"
    />
  </UDropdownMenu>
</template>

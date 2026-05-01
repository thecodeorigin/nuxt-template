<script setup lang="ts">
import type { ImpersonationCandidate } from '#layers/auth/app/api/useAuthApi'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAuthApi } from '#layers/auth/app/api/useAuthApi'

defineProps<{
  collapsed?: boolean
}>()

const authApi = useAuthApi()
const authStore = useAuthStore()
const toast = useToast()

const canImpersonate = computed(
  () => (authStore.currentUser?.abilities ?? []).includes('user:impersonate')
    || authStore.isImpersonating,
)

const candidates = ref<ImpersonationCandidate[]>([])
const candidatesLoaded = ref(false)
const busy = ref(false)

async function ensureCandidates() {
  if (candidatesLoaded.value || authStore.isImpersonating)
    return
  try {
    candidates.value = await authApi.fetchImpersonationCandidates()
    candidatesLoaded.value = true
  }
  catch {
    candidates.value = []
  }
}

async function startImpersonation(userId: string, label: string) {
  busy.value = true
  try {
    await authStore.startImpersonation(userId)
    toast.add({ title: `Now impersonating ${label}`, color: 'success' })
    if (import.meta.client)
      window.location.reload()
  }
  catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string }, statusMessage?: string }
    toast.add({
      title: 'Impersonation failed',
      description: error?.data?.statusMessage ?? error?.statusMessage ?? 'Unknown error',
      color: 'error',
    })
  }
  finally {
    busy.value = false
  }
}

async function stopImpersonation() {
  busy.value = true
  try {
    await authStore.stopImpersonation()
    toast.add({ title: 'Stopped impersonation', color: 'success' })
    if (import.meta.client)
      window.location.reload()
  }
  catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string }, statusMessage?: string }
    toast.add({
      title: 'Stop impersonation failed',
      description: error?.data?.statusMessage ?? error?.statusMessage ?? 'Unknown error',
      color: 'error',
    })
  }
  finally {
    busy.value = false
  }
}

const triggerLabel = computed(() => {
  if (authStore.isImpersonating)
    return authStore.currentUser?.name ?? authStore.currentUser?.primary_email ?? 'Impersonating'
  return 'Nuxt Template'
})

const triggerIcon = computed(() =>
  authStore.isImpersonating ? 'i-lucide-user-cog' : 'i-lucide-cuboid',
)

const items = computed<DropdownMenuItem[][]>(() => {
  const groups: DropdownMenuItem[][] = []

  groups.push([{
    type: 'label',
    label: authStore.isImpersonating
      ? `Impersonating ${authStore.currentUser?.name ?? authStore.currentUser?.primary_email}`
      : `Signed in as ${authStore.currentUser?.name ?? authStore.currentUser?.primary_email ?? 'guest'}`,
  }])

  if (authStore.isImpersonating) {
    groups.push([{
      label: `Real user: ${authStore.impersonator?.name ?? authStore.impersonator?.primary_email}`,
      icon: 'i-lucide-shield',
      disabled: true,
    }, {
      label: 'Stop impersonating',
      icon: 'i-lucide-log-out',
      color: 'warning',
      onSelect: () => { void stopImpersonation() },
    }])
  }
  else {
    if (candidates.value.length > 0) {
      groups.push(candidates.value.map(c => ({
        label: c.name ?? c.username ?? c.primary_email,
        icon: 'i-lucide-user',
        disabled: !!c.is_suspended || busy.value,
        onSelect: () => { void startImpersonation(c.id, c.name ?? c.primary_email) },
      })))
    }
    else if (candidatesLoaded.value) {
      groups.push([{
        label: 'No users available',
        disabled: true,
      }])
    }
    else {
      groups.push([{
        label: 'Loading users…',
        disabled: true,
      }])
    }
  }

  return groups
})
</script>

<template>
  <UDropdownMenu
    v-if="canImpersonate"
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-56' : 'w-(--reka-dropdown-menu-trigger-width)' }"
    @update:open="(o: boolean) => o && ensureCandidates()"
  >
    <UButton
      :icon="triggerIcon"
      :label="collapsed ? undefined : triggerLabel"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      :color="authStore.isImpersonating ? 'warning' : 'neutral'"
      :variant="authStore.isImpersonating ? 'soft' : 'ghost'"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{ trailingIcon: 'text-dimmed' }"
      data-testid="impersonate-menu-trigger"
    />
  </UDropdownMenu>

  <div
    v-else
    class="flex items-center gap-2 px-2 py-2"
    data-testid="brand-mark"
  >
    <UIcon name="i-lucide-cuboid" class="size-5 text-primary" />
    <span v-if="!collapsed" class="font-semibold text-highlighted">Nuxt Template</span>
  </div>
</template>

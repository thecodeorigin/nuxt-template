<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAuthApi } from '#layers/auth/app/api/useAuthApi'

defineProps<{
  collapsed?: boolean
}>()

const authApi = useAuthApi()
const authStore = useAuthStore()
const toast = useToast()
const { $ability } = useNuxtApp()

const canImpersonate = computed(
  () => (authStore.currentUser?.abilities ?? []).includes('user:impersonate')
    || authStore.isImpersonating,
)

const canManageUsers = computed(() => $ability.can('read', 'user'))

const showMenu = computed(() => canImpersonate.value || canManageUsers.value)

const candidatesOpen = ref(false)
const scrollEl = ref<HTMLElement | null>(null)
const busy = ref(false)

const { items: candidates, q, hasMore, loading, loadMore, reset } = useInfiniteList(
  opts => authApi.fetchImpersonationCandidates(opts).then(p => p),
  { immediate: false },
)

useInfiniteScroll(scrollEl, loadMore, { distance: 80, canLoadMore: () => hasMore.value })

watch(candidatesOpen, (val) => {
  if (val) {
    reset()
    loadMore()
  }
})

async function startImpersonation(userId: string, label: string) {
  busy.value = true
  candidatesOpen.value = false
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

const triggerLabel = computed(() => authStore.isImpersonating
  ? (authStore.currentUser?.name ?? authStore.currentUser?.primary_email)
  : (authStore.currentUser?.name ?? authStore.currentUser?.primary_email ?? 'guest'))

const triggerIcon = computed(() =>
  authStore.isImpersonating ? 'i-lucide-user-cog' : 'i-lucide-cuboid',
)

const stopItems = computed<DropdownMenuItem[][]>(() => [[
  {
    label: `Real user: ${authStore.impersonator?.name ?? authStore.impersonator?.primary_email}`,
    icon: 'i-lucide-shield',
    disabled: true,
  },
  {
    label: 'Stop impersonating',
    icon: 'i-lucide-log-out',
    color: 'warning' as const,
    onSelect: () => { void stopImpersonation() },
  },
]])
</script>

<template>
  <div v-if="showMenu">
    <UDropdownMenu
      v-if="authStore.isImpersonating"
      :items="stopItems"
      :content="{ align: 'center', collisionPadding: 12 }"
      :ui="{ content: collapsed ? 'w-56' : 'w-(--reka-dropdown-menu-trigger-width)' }"
    >
      <UButton
        :icon="triggerIcon"
        :label="collapsed ? undefined : triggerLabel"
        :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
        color="warning"
        variant="soft"
        block
        :square="collapsed"
        class="data-[state=open]:bg-elevated py-2"
        :ui="{ trailingIcon: 'text-dimmed' }"
        data-testid="impersonate-menu-trigger"
      />
    </UDropdownMenu>

    <UPopover
      v-else-if="canImpersonate"
      v-model:open="candidatesOpen"
      :content="{ align: 'center', collisionPadding: 12 }"
    >
      <UButton
        :icon="triggerIcon"
        :label="collapsed ? undefined : triggerLabel"
        :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
        color="neutral"
        variant="ghost"
        block
        :square="collapsed"
        class="data-[state=open]:bg-elevated py-2"
        :ui="{ trailingIcon: 'text-dimmed' }"
        data-testid="impersonate-menu-trigger"
      />

      <template #content>
        <div :class="collapsed ? 'w-56' : 'w-56'">
          <div class="p-2 border-b border-default">
            <UInput
              v-model="q"
              icon="i-lucide-search"
              placeholder="Search users…"
              size="sm"
              autofocus
            />
          </div>
          <div ref="scrollEl" class="max-h-60 overflow-y-auto py-1">
            <button
              v-for="c in candidates"
              :key="c.id"
              type="button"
              :disabled="!!c.is_suspended || busy"
              class="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-elevated cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed"
              @click="startImpersonation(c.id, c.name ?? c.primary_email)"
            >
              <UIcon name="i-lucide-user" class="size-4 shrink-0" />
              <span class="truncate">{{ c.name ?? c.username ?? c.primary_email }}</span>
            </button>
            <div v-if="loading" class="px-3 py-1.5 text-sm text-muted">
              Loading…
            </div>
            <div v-else-if="candidates.length === 0" class="px-3 py-1.5 text-sm text-muted">
              No users available.
            </div>
          </div>
        </div>
      </template>
    </UPopover>

    <div
      v-else
      class="flex items-center gap-2 px-2 py-2"
      data-testid="brand-mark"
    >
      <UIcon name="i-lucide-cuboid" class="size-5 text-primary" />
      <span v-if="!collapsed" class="font-semibold text-highlighted">Nuxt Template</span>
    </div>
  </div>

  <div
    v-else
    class="flex items-center gap-2 px-2 py-2"
    data-testid="brand-mark"
  >
    <UIcon name="i-lucide-cuboid" class="size-5 text-primary" />
    <span v-if="!collapsed" class="font-semibold text-highlighted">Nuxt Template</span>
  </div>
</template>

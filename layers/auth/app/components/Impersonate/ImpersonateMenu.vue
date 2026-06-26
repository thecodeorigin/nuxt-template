<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { user, isImpersonating, impersonator, impersonate, stopImpersonating, getImpersonatableUsers } = useAuth()
const { $ability } = useNuxtApp()
const toast = useToast()

const canImpersonate = computed(
  () => isImpersonating.value || $ability.can('manage', 'all'),
)

const showMenu = computed(() => canImpersonate.value)

const candidatesOpen = ref(false)
const busy = ref(false)
const searchQ = ref('')
const candidates = ref<{ id: string, email: string, name: string | null }[]>([])
const loadingCandidates = ref(false)

async function loadCandidates() {
  loadingCandidates.value = true
  try {
    const result = await getImpersonatableUsers()
    candidates.value = result.items
  }
  catch {
    candidates.value = []
  }
  finally {
    loadingCandidates.value = false
  }
}

const filteredCandidates = computed(() =>
  searchQ.value
    ? candidates.value.filter(c =>
        (c.name ?? '').toLowerCase().includes(searchQ.value.toLowerCase())
        || c.email.toLowerCase().includes(searchQ.value.toLowerCase()),
      )
    : candidates.value,
)

watch(candidatesOpen, (val) => {
  if (val) {
    searchQ.value = ''
    void loadCandidates()
  }
})

async function startImpersonation(userId: string, label: string) {
  busy.value = true
  candidatesOpen.value = false
  try {
    await impersonate(userId)
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

async function handleStop() {
  busy.value = true
  try {
    await stopImpersonating()
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

const triggerLabel = computed(() => user.value?.name ?? user.value?.email ?? 'guest')
const triggerIcon = computed(() =>
  isImpersonating.value ? 'i-lucide-user-cog' : 'i-lucide-cuboid',
)

const stopItems = computed<DropdownMenuItem[][]>(() => [[
  {
    label: `Real user: ${impersonator.value?.name ?? impersonator.value?.email}`,
    icon: 'i-lucide-shield',
    disabled: true,
  },
  {
    label: 'Stop impersonating',
    icon: 'i-lucide-log-out',
    color: 'warning' as const,
    onSelect: () => { void handleStop() },
  },
]])
</script>

<template>
  <div v-if="showMenu">
    <UDropdownMenu
      v-if="isImpersonating"
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
        <div class="w-56">
          <div class="p-2 border-b border-default">
            <UInput
              v-model="searchQ"
              icon="i-lucide-search"
              placeholder="Search users…"
              size="sm"
              autofocus
            />
          </div>
          <div class="max-h-60 overflow-y-auto py-1">
            <button
              v-for="c in filteredCandidates"
              :key="c.id"
              type="button"
              :disabled="busy"
              class="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-elevated cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed"
              @click="startImpersonation(c.id, c.name ?? c.email)"
            >
              <UIcon name="i-lucide-user" class="size-4 shrink-0" />
              <span class="truncate">{{ c.name ?? c.email }}</span>
            </button>
            <div v-if="loadingCandidates" class="px-3 py-1.5 text-sm text-muted">
              Loading…
            </div>
            <div v-else-if="filteredCandidates.length === 0 && !loadingCandidates" class="px-3 py-1.5 text-sm text-muted">
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

<script setup lang="ts">
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'

defineProps<{ collapsed?: boolean }>()

const authStore = useAuthStore()
const orgApi = useOrganizationApi()
const toast = useToast()
const router = useRouter()

const scrollEl = ref<HTMLElement | null>(null)
const { items: orgs, q, hasMore, loading, loadMore, reset } = useInfiniteList(
  opts => orgApi.fetchOrganizations(opts).then(p => p),
  { immediate: false },
)

useInfiniteScroll(scrollEl, loadMore, { distance: 80, canLoadMore: () => hasMore.value })

const { data: activeOrg, error: activeOrgError } = useAsyncData(
  'organization-menu-active',
  () => authStore.activeOrganizationId ? orgApi.fetchOrganization() : Promise.resolve(null),
  { default: () => null, watch: [() => authStore.activeOrganizationId] },
)
whenError(activeOrgError)

const open = ref(false)
const createModalOpen = ref(false)
const creating = ref(false)
const newName = ref('')

watch(open, (val) => {
  if (val) {
    reset()
    loadMore()
  }
})

watch(createModalOpen, (val) => {
  if (!val)
    newName.value = ''
})

async function select(id: string) {
  if (id === authStore.activeOrganizationId)
    return
  open.value = false
  await authStore.switchOrganization(id)
  if (import.meta.client)
    window.location.reload()
}

async function submitCreate() {
  const name = newName.value.trim()
  if (!name)
    return
  creating.value = true
  try {
    const org = await orgApi.createOrganization({ name })
    toast.add({ title: 'Organization created', color: 'success' })
    createModalOpen.value = false
    open.value = false
    await authStore.switchOrganization((org as { id: string }).id)
    if (import.meta.client)
      window.location.reload()
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Failed to create organization', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    creating.value = false
  }
}

const activeName = computed(() =>
  orgs.value.find(o => o.id === authStore.activeOrganizationId)?.name ?? activeOrg.value?.name ?? 'Organization')
</script>

<template>
  <UPopover v-model:open="open" :content="{ align: 'center', collisionPadding: 12 }">
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

    <template #content>
      <div class="w-56 flex flex-col">
        <div class="p-2 border-b border-default">
          <UInput
            v-model="q"
            icon="i-lucide-search"
            placeholder="Search organizations…"
            size="sm"
            autofocus
          />
        </div>

        <div ref="scrollEl" class="max-h-60 overflow-y-auto py-1">
          <button
            v-for="org in orgs"
            :key="org.id"
            type="button"
            class="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-elevated cursor-pointer text-left"
            @click="select(org.id)"
          >
            <UIcon
              :name="org.id === authStore.activeOrganizationId ? 'i-lucide-check' : 'i-lucide-building'"
              class="size-4 shrink-0"
            />
            <span class="truncate">{{ org.name }}</span>
          </button>
          <div v-if="loading" class="px-3 py-1.5 text-sm text-muted">
            Loading…
          </div>
          <div v-else-if="orgs.length === 0 && !loading" class="px-3 py-1.5 text-sm text-muted">
            No organizations found.
          </div>
        </div>

        <div class="border-t border-default p-1">
          <button
            type="button"
            class="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-elevated cursor-pointer text-left rounded"
            @click="open = false; router.push('/organization')"
          >
            <UIcon name="i-lucide-settings" class="size-4 shrink-0 text-muted" />
            <span class="text-muted">Manage organization</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-elevated cursor-pointer text-left rounded"
            @click="open = false; createModalOpen = true"
          >
            <UIcon name="i-lucide-plus" class="size-4 shrink-0 text-muted" />
            <span class="text-muted">Create organization</span>
          </button>
        </div>
      </div>
    </template>
  </UPopover>

  <UModal v-model:open="createModalOpen" title="Create organization">
    <template #body>
      <UFormField label="Name" required>
        <UInput
          v-model="newName"
          placeholder="e.g. Acme Corp"
          class="w-full"
          autofocus
          @keydown.enter="submitCreate"
        />
      </UFormField>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="createModalOpen = false" />
        <UButton label="Create" :loading="creating" :disabled="!newName.trim()" @click="submitCreate" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{ collapsed?: boolean }>()

const { getOrganizations, switchOrganization, session } = useAuth()
const toast = useToast()

const open = ref(false)
const createModalOpen = ref(false)
const creating = ref(false)
const newName = ref('')
const searchQ = ref('')

const orgs = computed(() => getOrganizations())

const filteredOrgs = computed(() =>
  searchQ.value
    ? orgs.value.filter(o => o.name.toLowerCase().includes(searchQ.value.toLowerCase()))
    : orgs.value,
)

watch(createModalOpen, (val) => {
  if (!val)
    newName.value = ''
})

async function select(id: string) {
  if (id === session.value?.activeOrg)
    return
  open.value = false
  try {
    await switchOrganization(id)
    if (import.meta.client)
      window.location.reload()
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Failed to switch organization', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
}

const activeName = computed(() =>
  orgs.value.find(o => o.id === session.value?.activeOrg)?.name ?? 'Organization',
)
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
            v-model="searchQ"
            icon="i-lucide-search"
            placeholder="Search organizations…"
            size="sm"
            autofocus
          />
        </div>

        <div class="max-h-60 overflow-y-auto py-1">
          <button
            v-for="org in filteredOrgs"
            :key="org.id"
            type="button"
            class="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-elevated cursor-pointer text-left"
            @click="select(org.id)"
          >
            <UIcon
              :name="org.id === session?.activeOrg ? 'i-lucide-check' : 'i-lucide-building'"
              class="size-4 shrink-0"
            />
            <span class="truncate">{{ org.name }}</span>
          </button>
          <div v-if="orgs.length === 0" class="px-3 py-1.5 text-sm text-muted">
            No organizations found.
          </div>
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
          @keydown.enter="() => {}"
        />
      </UFormField>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="createModalOpen = false" />
        <UButton label="Create" :loading="creating" :disabled="!newName.trim()" @click="() => {}" />
      </div>
    </template>
  </UModal>
</template>

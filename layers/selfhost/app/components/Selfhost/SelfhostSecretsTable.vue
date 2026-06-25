<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { SelfhostSecretItem } from '#layers/selfhost/app/api/useSelfhostApi'
import { useSelfhostApi } from '#layers/selfhost/app/api/useSelfhostApi'
import SelfhostSecretImportModal from '#layers/selfhost/app/components/Selfhost/SelfhostSecretImportModal.vue'

const props = defineProps<{ workersDevUrl: string | null | undefined }>()

const toast = useToast()
const api = useSelfhostApi()

const { data, refresh } = useAsyncData<{ items: SelfhostSecretItem[] } | null>(
  'selfhost-secrets',
  () => api.fetchSelfhostSecrets(),
  { default: () => null },
)

const items = computed<SelfhostSecretItem[]>(() => data.value?.items ?? [])

const search = ref('')
const importOpen = ref(false)
const saving = ref(false)

// drafts: pending edits waiting for "Save all". value === '' with action 'delete' means clear-on-save.
const drafts = reactive<Record<string, { value: string, action: 'set' }>>({})
// revealed: plaintext fetched on demand. Absent = masked. null = in flight.
const revealed = reactive<Record<string, string | null>>({})
// editingKey: currently inline-editing this row.
const editingKey = ref<string | null>(null)
// editingBuffer: live value of the inline input before commit.
const editingBuffer = ref('')

const dirtyCount = computed(() => Object.keys(drafts).length)

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q)
    return items.value
  return items.value.filter(i =>
    i.key.toLowerCase().includes(q)
    || i.label.toLowerCase().includes(q)
    || i.description.toLowerCase().includes(q),
  )
})

const GROUP_ORDER = ['system', 'oauth', 'smtp', 'payments', 'support', 'auth'] as const
const GROUP_TITLES: Record<string, string> = {
  system: 'System (auto-generated)',
  oauth: 'OAuth providers',
  smtp: 'Email (SMTP)',
  payments: 'Payments',
  support: 'Support',
  auth: 'Authentication',
}

const grouped = computed(() =>
  GROUP_ORDER
    .map(g => ({ group: g, items: filteredItems.value.filter(i => i.category === g) }))
    .filter(s => s.items.length > 0),
)

const oauthCallbacks = computed(() => {
  if (!props.workersDevUrl)
    return null
  return {
    thecodeorigin: `${props.workersDevUrl}/api/auth/oidc/callback`,
  }
})

function startEdit(item: SelfhostSecretItem) {
  if (item.isAuto)
    return
  editingKey.value = item.key
  editingBuffer.value = drafts[item.key]?.value ?? ''
  // Don't pre-populate from revealed value — Doppler shows empty input to overwrite.
}

function commitEdit() {
  const key = editingKey.value
  if (!key)
    return
  const value = editingBuffer.value
  if (value.length === 0) {
    // No value typed — drop the draft (revert).
    delete drafts[key]
  }
  else {
    drafts[key] = { value, action: 'set' }
  }
  editingKey.value = null
  editingBuffer.value = ''
}

function cancelEdit() {
  editingKey.value = null
  editingBuffer.value = ''
}

function discardDraft(key: string) {
  delete drafts[key]
  if (editingKey.value === key)
    cancelEdit()
}

function discardAll() {
  for (const k of Object.keys(drafts))
    delete drafts[k]
  cancelEdit()
}

async function reveal(item: SelfhostSecretItem) {
  if (!item.isSet)
    return
  revealed[item.key] = null
  try {
    const result = await api.revealSelfhostSecret(item.key)
    revealed[item.key] = result.value
  }
  catch (err) {
    delete revealed[item.key]
    toast.add({
      title: 'Could not reveal',
      description: getErrorMessage(err),
      color: 'error',
    })
  }
}

function hide(key: string) {
  delete revealed[key]
}

async function copyValue(item: SelfhostSecretItem) {
  // If we already have it revealed, copy that. Otherwise reveal silently then copy.
  let value = revealed[item.key]
  if (value === undefined || value === null) {
    try {
      const result = await api.revealSelfhostSecret(item.key)
      value = result.value
    }
    catch (err) {
      toast.add({ title: 'Could not copy', description: getErrorMessage(err), color: 'error' })
      return
    }
  }
  await navigator.clipboard.writeText(value)
  toast.add({ title: `Copied ${item.key}`, color: 'success' })
}

async function saveAll() {
  const updates = Object.entries(drafts).map(([key, d]) => ({ key, value: d.value }))
  if (updates.length === 0)
    return
  saving.value = true
  try {
    const result = await api.patchSelfhostSecrets(updates)
    toast.add({
      title: `Saved ${result.updated} secret${result.updated === 1 ? '' : 's'}`,
      description: result.pushedToCloudflare > 0
        ? `Pushed ${result.pushedToCloudflare} to the deployed worker.`
        : 'Stored. Will apply on next deploy.',
      color: 'success',
    })
    discardAll()
    // Clear any revealed values for changed keys so a stale plaintext isn't shown.
    for (const u of updates)
      delete revealed[u.key]
    await refresh()
  }
  catch (err) {
    toast.add({ title: 'Save failed', description: getErrorMessage(err), color: 'error' })
  }
  finally {
    saving.value = false
  }
}

function stageImported(staged: Record<string, string>) {
  for (const [key, value] of Object.entries(staged))
    drafts[key] = { value, action: 'set' }
  importOpen.value = false
  toast.add({
    title: `Staged ${Object.keys(staged).length} secret(s)`,
    description: 'Review the unsaved changes bar, then click Save all.',
    color: 'info',
  })
}

async function copyCallback(url: string) {
  await navigator.clipboard.writeText(url)
  toast.add({ title: 'Callback URL copied', color: 'success' })
}

function rowMenuItems(item: SelfhostSecretItem): DropdownMenuItem[][] {
  const isRevealed = revealed[item.key] != null && revealed[item.key] !== undefined
  const groups: DropdownMenuItem[][] = []

  const main: DropdownMenuItem[] = []
  if (item.isSet) {
    main.push(isRevealed
      ? { label: 'Hide', icon: 'i-lucide-eye-off', onSelect: () => hide(item.key) }
      : { label: 'Reveal', icon: 'i-lucide-eye', onSelect: () => reveal(item) })
    main.push({ label: 'Copy value', icon: 'i-lucide-copy', onSelect: () => copyValue(item) })
  }
  if (!item.isAuto)
    main.push({ label: item.isSet ? 'Replace value' : 'Add value', icon: 'i-lucide-pencil', onSelect: () => startEdit(item) })
  if (main.length > 0)
    groups.push(main)

  if (drafts[item.key]) {
    groups.push([
      { label: 'Discard change', icon: 'i-lucide-undo-2', color: 'error' as const, onSelect: () => discardDraft(item.key) },
    ])
  }
  return groups
}

function formatUpdated(iso: string | null) {
  if (!iso)
    return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime()))
    return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="relative min-w-0">
    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold">
              Configuration
            </p>
            <p class="text-xs text-muted mt-1">
              Environment variables on your deployed Worker. Auto-generated values are stable across redeploys.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-upload"
              variant="outline"
              size="sm"
              @click="importOpen = true"
            >
              Import .env
            </UButton>
          </div>
        </div>

        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search secrets..."
          size="sm"
          class="w-full mt-3"
        />
      </template>

      <div class="space-y-8">
        <div v-if="oauthCallbacks && grouped.find(g => g.group === 'oauth')" class="-mt-2">
          <UAlert
            color="neutral"
            variant="subtle"
            icon="i-lucide-info"
            title="OAuth callback URLs"
          >
            <template #description>
              <p class="text-xs">
                Register this redirect URI on the THECODEORIGIN IdP admin console:
              </p>
              <div class="mt-2 space-y-1 min-w-0">
                <div class="flex items-center gap-2 text-xs font-mono min-w-0">
                  <span class="text-muted shrink-0">OIDC callback:</span>
                  <code class="flex-1 min-w-0 truncate">{{ oauthCallbacks.thecodeorigin }}</code>
                  <UButton size="xs" variant="ghost" icon="i-lucide-copy" @click="copyCallback(oauthCallbacks.thecodeorigin)" />
                </div>
              </div>
            </template>
          </UAlert>
        </div>

        <div v-for="section in grouped" :key="section.group">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">
              {{ GROUP_TITLES[section.group] }}
            </h3>
            <UBadge variant="subtle" color="neutral" size="xs">
              {{ section.items.length }}
            </UBadge>
          </div>

          <ul class="rounded-md border border-default divide-y divide-default overflow-hidden">
            <li
              v-for="item in section.items"
              :key="item.key"
              class="px-3 py-2.5 hover:bg-elevated/50 transition-colors"
              :class="{ 'bg-warning/5': drafts[item.key] }"
            >
              <div class="flex items-center gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <code class="text-xs font-mono font-semibold">{{ item.key }}</code>
                    <UBadge v-if="item.isAuto" color="info" variant="subtle" size="xs">
                      Auto
                    </UBadge>
                    <UBadge v-else-if="item.isSet" color="success" variant="subtle" size="xs">
                      Set
                    </UBadge>
                    <UBadge v-if="drafts[item.key]" color="warning" variant="subtle" size="xs">
                      Modified
                    </UBadge>
                  </div>
                  <p v-if="item.description" class="text-xs text-muted mt-0.5 truncate">
                    {{ item.description }}
                  </p>
                </div>

                <div class="flex-1 min-w-0 max-w-md flex items-center gap-1.5">
                  <template v-if="editingKey === item.key">
                    <UInput
                      v-model="editingBuffer"
                      :type="item.type === 'secret_text' ? 'password' : 'text'"
                      :placeholder="item.isSet ? 'Enter new value' : 'Enter value'"
                      autofocus
                      class="flex-1 font-mono"
                      autocomplete="off"
                      @keyup.enter="commitEdit"
                      @keyup.esc="cancelEdit"
                      @blur="commitEdit"
                    />
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      class="flex-1 min-w-0 text-left text-xs font-mono px-2 py-1 rounded hover:bg-elevated truncate"
                      :class="item.isAuto ? 'cursor-default text-muted' : 'cursor-pointer'"
                      :disabled="item.isAuto"
                      @click="startEdit(item)"
                    >
                      <span v-if="drafts[item.key]" class="text-warning">
                        {{ item.type === 'secret_text' ? '•'.repeat(Math.min(drafts[item.key]!.value.length, 12)) : drafts[item.key]!.value }}
                      </span>
                      <span v-else-if="revealed[item.key] === null" class="text-muted italic">
                        revealing...
                      </span>
                      <span v-else-if="revealed[item.key] != null" class="text-default">
                        {{ revealed[item.key] }}
                      </span>
                      <span v-else-if="item.isSet" class="text-muted">
                        ••••••••
                      </span>
                      <span v-else-if="item.isAuto" class="text-muted italic">
                        auto-generated at deploy time
                      </span>
                      <span v-else class="text-muted italic">
                        Click to add value
                      </span>
                    </button>

                    <UButton
                      v-if="item.isSet && revealed[item.key] != null"
                      icon="i-lucide-eye-off"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :aria-label="`Hide ${item.key}`"
                      @click="hide(item.key)"
                    />
                    <UButton
                      v-else-if="item.isSet"
                      icon="i-lucide-eye"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :loading="revealed[item.key] === null"
                      :aria-label="`Reveal ${item.key}`"
                      @click="reveal(item)"
                    />
                    <UButton
                      v-if="item.isSet"
                      icon="i-lucide-copy"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :aria-label="`Copy ${item.key}`"
                      @click="copyValue(item)"
                    />
                  </template>
                </div>

                <UDropdownMenu v-if="rowMenuItems(item).length" :items="rowMenuItems(item)">
                  <UButton
                    icon="i-lucide-ellipsis-vertical"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    :aria-label="`Actions for ${item.key}`"
                  />
                </UDropdownMenu>
              </div>

              <p v-if="item.isSet && item.updatedAt" class="text-2xs text-muted mt-1 pl-2">
                Updated {{ formatUpdated(item.updatedAt) }}
              </p>
            </li>
          </ul>
        </div>

        <p v-if="filteredItems.length === 0" class="text-center text-sm text-muted py-8">
          No secrets match "{{ search }}".
        </p>
      </div>
    </UCard>

    <Transition
      enter-active-class="transition-all duration-150"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="dirtyCount > 0"
        class="sticky bottom-4 mt-4 z-10"
      >
        <UCard
          :ui="{ root: 'shadow-xl border-warning/40', body: 'p-3' }"
        >
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-circle-alert" class="text-warning size-5 shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold">
                {{ dirtyCount }} unsaved change{{ dirtyCount === 1 ? '' : 's' }}
              </p>
              <p class="text-xs text-muted truncate">
                {{ Object.keys(drafts).join(', ') }}
              </p>
            </div>
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              :disabled="saving"
              @click="discardAll"
            >
              Discard
            </UButton>
            <UButton
              color="primary"
              size="sm"
              icon="i-lucide-save"
              :loading="saving"
              @click="saveAll"
            >
              Save all
            </UButton>
          </div>
        </UCard>
      </div>
    </Transition>

    <SelfhostSecretImportModal
      v-model:open="importOpen"
      :catalog="items"
      @stage="stageImported"
    />
  </div>
</template>

<style scoped>
.text-2xs {
  font-size: 0.625rem;
  line-height: 0.875rem;
}
</style>

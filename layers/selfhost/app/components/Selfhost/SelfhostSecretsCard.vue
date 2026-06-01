<script setup lang="ts">
import type { SelfhostSecretItem } from '#layers/selfhost/app/api/useSelfhostApi'
import { useSelfhostApi } from '#layers/selfhost/app/api/useSelfhostApi'

const props = defineProps<{ workersDevUrl: string | null | undefined }>()

const toast = useToast()
const api = useSelfhostApi()

const { data, refresh } = useAsyncData<{ items: SelfhostSecretItem[] } | null>(
  'selfhost-secrets',
  () => api.fetchSelfhostSecrets(),
  { default: () => null },
)

const inputs = reactive<Record<string, string>>({})
const saving = ref<string | null>(null)

const groups = computed(() => {
  const items = data.value?.items ?? []
  const out: Record<string, SelfhostSecretItem[]> = {
    system: [],
    oauth: [],
    smtp: [],
    payments: [],
    support: [],
    auth: [],
  }
  for (const item of items)
    out[item.category]!.push(item)
  return out
})

const groupTitles: Record<string, string> = {
  system: 'System (auto-generated)',
  oauth: 'OAuth providers',
  smtp: 'Email (SMTP)',
  payments: 'Payments',
  support: 'Support',
  auth: 'Authentication',
}

const oauthCallbacks = computed(() => {
  if (!props.workersDevUrl)
    return { google: '', github: '' }
  return {
    google: `${props.workersDevUrl}/api/auth/google/callback`,
    github: `${props.workersDevUrl}/api/auth/github/callback`,
  }
})

async function autoSaveOnBlur(key: string) {
  if (inputs[key]?.trim() && saving.value !== key)
    await save(key)
}

async function save(key: string) {
  const value = inputs[key]?.trim()
  if (!value) {
    toast.add({ title: 'Value is empty', color: 'warning' })
    return
  }
  saving.value = key
  try {
    const result = await api.patchSelfhostSecrets([{ key, value }])
    toast.add({
      title: `${key} saved`,
      description: result.pushedToCloudflare ? 'Pushed to deployed worker.' : 'Stored. Will apply on next deploy.',
      color: 'success',
    })
    inputs[key] = ''
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    toast.add({ title: 'Save failed', description: err?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    saving.value = null
  }
}

async function copyCallback(url: string) {
  await navigator.clipboard.writeText(url)
  toast.add({ title: 'Callback URL copied', color: 'success' })
}
</script>

<template>
  <UCard>
    <template #header>
      <p class="font-semibold">
        Configuration
      </p>
      <p class="text-xs text-muted mt-1">
        Environment variables and secrets on your deployed Worker.
        Auto-generated values are stable across redeploys.
      </p>
    </template>

    <div class="space-y-6">
      <div v-for="(items, group) in groups" v-show="items.length" :key="group">
        <h3 class="text-sm font-semibold mb-2">
          {{ groupTitles[group] }}
        </h3>

        <UAlert
          v-if="group === 'oauth' && (oauthCallbacks.google || oauthCallbacks.github)"
          color="neutral"
          variant="subtle"
          icon="i-lucide-info"
          class="mb-3"
        >
          <template #description>
            <p class="text-xs">
              Whitelist these callback URLs in your OAuth provider settings:
            </p>
            <div class="mt-2 space-y-1">
              <div class="flex items-center gap-2 text-xs font-mono">
                <span class="text-muted">Google:</span>
                <code class="flex-1 truncate">{{ oauthCallbacks.google }}</code>
                <UButton size="xs" variant="ghost" icon="i-lucide-copy" @click="copyCallback(oauthCallbacks.google)" />
              </div>
              <div class="flex items-center gap-2 text-xs font-mono">
                <span class="text-muted">GitHub:</span>
                <code class="flex-1 truncate">{{ oauthCallbacks.github }}</code>
                <UButton size="xs" variant="ghost" icon="i-lucide-copy" @click="copyCallback(oauthCallbacks.github)" />
              </div>
            </div>
          </template>
        </UAlert>

        <div class="space-y-3">
          <div v-for="item in items" :key="item.key" class="border border-default rounded p-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <code class="text-xs font-mono">{{ item.key }}</code>
                  <UBadge v-if="item.isSet" color="success" variant="subtle" size="xs">
                    Set
                  </UBadge>
                  <UBadge v-else color="neutral" variant="subtle" size="xs">
                    Not set
                  </UBadge>
                  <UBadge v-if="item.isAuto" color="info" variant="subtle" size="xs">
                    Auto
                  </UBadge>
                </div>
                <p class="text-xs text-muted mt-1">
                  {{ item.description }}
                </p>
              </div>
            </div>

            <div v-if="!item.isAuto" class="mt-3 flex gap-2">
              <UInput
                v-model="inputs[item.key]"
                :type="item.type === 'secret_text' ? 'password' : 'text'"
                :placeholder="item.isSet ? 'Paste new value to overwrite' : 'Enter value'"
                class="flex-1 font-mono"
                autocomplete="off"
                @keyup.enter="save(item.key)"
                @blur="autoSaveOnBlur(item.key)"
              />
              <UButton
                :loading="saving === item.key"
                :disabled="!inputs[item.key]?.trim()"
                size="sm"
                @click="save(item.key)"
              >
                Save
              </UButton>
            </div>
            <p v-if="inputs[item.key]?.trim() && saving !== item.key" class="mt-2 text-xs text-warning">
              Unsaved — press Enter, click Save, or tab away to push to your worker.
            </p>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

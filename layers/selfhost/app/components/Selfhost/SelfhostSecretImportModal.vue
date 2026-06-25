<script setup lang="ts">
import type { SelfhostSecretItem } from '#layers/selfhost/app/api/useSelfhostApi'

const props = defineProps<{
  open: boolean
  catalog: SelfhostSecretItem[]
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  'stage': [Record<string, string>]
}>()

const localOpen = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

const raw = ref('')

const ENV_LINE_RE = /^[\t ]*(?:export[\t ]+)?([A-Z][A-Z0-9_]*)[\t ]*=(.*)$/

interface ParsedRow {
  key: string
  value: string
  status: 'recognized' | 'auto' | 'unknown'
  reason?: string
}

function unquote(v: string): string {
  const trimmed = v.trim()
  if (trimmed.length >= 2) {
    const first = trimmed[0]
    const last = trimmed.at(-1)
    if ((first === '"' && last === '"') || (first === '\'' && last === '\''))
      return trimmed.slice(1, -1)
  }
  // Strip trailing inline comment if value is unquoted.
  const hashIdx = trimmed.indexOf(' #')
  return hashIdx === -1 ? trimmed : trimmed.slice(0, hashIdx).trim()
}

const parsed = computed<ParsedRow[]>(() => {
  if (!raw.value.trim())
    return []
  const catalogMap = new Map(props.catalog.map(c => [c.key, c]))
  const rows: ParsedRow[] = []
  const seen = new Set<string>()
  for (const line of raw.value.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#'))
      continue
    const m = ENV_LINE_RE.exec(trimmed)
    if (!m) {
      rows.push({ key: trimmed.slice(0, 60), value: '', status: 'unknown', reason: 'not a KEY=value line' })
      continue
    }
    const key = m[1]!
    if (seen.has(key))
      continue
    seen.add(key)
    const value = unquote(m[2] ?? '')
    const def = catalogMap.get(key)
    if (!def)
      rows.push({ key, value, status: 'unknown', reason: 'not in this app\'s catalog' })
    else if (def.isAuto)
      rows.push({ key, value, status: 'auto', reason: 'system-managed, cannot override' })
    else if (!value.length)
      rows.push({ key, value, status: 'unknown', reason: 'empty value' })
    else
      rows.push({ key, value, status: 'recognized' })
  }
  return rows
})

const recognized = computed(() => parsed.value.filter(r => r.status === 'recognized'))
const skipped = computed(() => parsed.value.filter(r => r.status !== 'recognized'))

function stage() {
  const payload: Record<string, string> = {}
  for (const row of recognized.value)
    payload[row.key] = row.value
  if (Object.keys(payload).length === 0)
    return
  emit('stage', payload)
  raw.value = ''
}

function reset() {
  raw.value = ''
}

watch(localOpen, (next) => {
  if (!next)
    reset()
})

function maskValue(v: string) {
  if (v.length <= 4)
    return '•'.repeat(v.length)
  return `${v.slice(0, 2)}${'•'.repeat(Math.min(v.length - 4, 10))}${v.slice(-2)}`
}
</script>

<template>
  <UModal
    v-model:open="localOpen"
    title="Import from .env"
    description="Paste the contents of a .env file. Recognized keys will be queued for review — nothing is saved until you confirm."
    :ui="{ content: 'max-w-2xl' }"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Paste .env contents">
          <UTextarea
            v-model="raw"
            :rows="10"
            class="w-full font-mono"
            placeholder="# Paste .env content here&#10;NUXT_SMTP_HOST=smtp.example.com&#10;NUXT_SMTP_PORT=587&#10;NUXT_THECODEORIGIN_ISSUER=&quot;https://auth.yourdomain.com/api/auth&quot;"
          />
        </UFormField>

        <div v-if="parsed.length > 0" class="space-y-3">
          <div v-if="recognized.length > 0">
            <p class="text-xs font-semibold uppercase tracking-wide text-success mb-1">
              Will import ({{ recognized.length }})
            </p>
            <ul class="rounded border border-default divide-y divide-default text-xs font-mono">
              <li v-for="row in recognized" :key="row.key" class="px-3 py-1.5 flex items-center gap-3">
                <code class="flex-1 truncate">{{ row.key }}</code>
                <span class="text-muted truncate max-w-[40%]">{{ maskValue(row.value) }}</span>
              </li>
            </ul>
          </div>

          <div v-if="skipped.length > 0">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
              Skipped ({{ skipped.length }})
            </p>
            <ul class="rounded border border-default divide-y divide-default text-xs font-mono">
              <li v-for="row in skipped" :key="row.key" class="px-3 py-1.5 flex items-center gap-3">
                <code class="flex-1 truncate text-muted">{{ row.key }}</code>
                <span class="text-2xs text-muted">{{ row.reason }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="localOpen = false">
          Cancel
        </UButton>
        <UButton
          color="primary"
          :disabled="recognized.length === 0"
          icon="i-lucide-arrow-right"
          @click="stage"
        >
          Stage {{ recognized.length }} key{{ recognized.length === 1 ? '' : 's' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.text-2xs {
  font-size: 0.625rem;
  line-height: 0.875rem;
}
</style>

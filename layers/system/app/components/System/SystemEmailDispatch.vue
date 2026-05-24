<script setup lang="ts">
import type { DispatchFilter } from '#layers/system/shared/schemas/dispatch'
import type { EditorToolbarItem } from '#ui/types'
import { useSystemApi } from '#layers/system/app/api/useSystemApi'
import { htmlHasText } from '#layers/system/shared/schemas/dispatch'

const EMAIL_SPLIT_RE = /[\s,;]+/

const api = useSystemApi()
const toast = useToast()

const { data: options } = useAsyncData(
  'system-dispatch-options',
  () => api.fetchDispatchOptions(),
  { default: () => ({ organizations: [], roles: [] }) },
)
const orgItems = computed(() => (options.value?.organizations ?? []).map(o => ({ label: o.label, value: o.id })))
const roleItems = computed(() => (options.value?.roles ?? []).map(r => ({ label: r.label, value: r.id })))

const filter = reactive<DispatchFilter>({
  allUsers: false,
  organizationIds: [],
  roleIds: [],
  emails: [],
})
const emailsText = ref('')
watch(emailsText, (v) => {
  filter.emails = v.split(EMAIL_SPLIT_RE).map(s => s.trim().toLowerCase()).filter(Boolean)
})

const subject = ref('')
const body = ref('')

const toolbarItems: EditorToolbarItem[][] = [
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Bold' } },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Italic' } },
    { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', tooltip: { text: 'Strikethrough' } },
    { kind: 'mark', mark: 'code', icon: 'i-lucide-code', tooltip: { text: 'Inline code' } },
  ],
  [
    { kind: 'heading', level: 2, icon: 'i-lucide-heading-2', tooltip: { text: 'Heading' } },
    { kind: 'bulletList', icon: 'i-lucide-list', tooltip: { text: 'Bullet list' } },
    { kind: 'orderedList', icon: 'i-lucide-list-ordered', tooltip: { text: 'Numbered list' } },
    { kind: 'blockquote', icon: 'i-lucide-quote', tooltip: { text: 'Quote' } },
  ],
  [
    { kind: 'link', icon: 'i-lucide-link', tooltip: { text: 'Link' } },
    { kind: 'undo', icon: 'i-lucide-undo-2', tooltip: { text: 'Undo' } },
    { kind: 'redo', icon: 'i-lucide-redo-2', tooltip: { text: 'Redo' } },
  ],
]

const preview = ref<{ total: number, enabled: number, skipped: number } | null>(null)
const result = ref<{ sent: number, failed: number, skipped: number, total: number } | null>(null)
const previewing = ref(false)
const sending = ref(false)
const confirmOpen = ref(false)

const hasCriteria = computed(() =>
  filter.allUsers || filter.organizationIds.length > 0 || filter.roleIds.length > 0 || filter.emails.length > 0,
)
const canSend = computed(() => hasCriteria.value && subject.value.trim().length > 0 && htmlHasText(body.value))

function resetPreview() {
  preview.value = null
  result.value = null
}

async function runPreview() {
  if (!hasCriteria.value)
    return
  previewing.value = true
  result.value = null
  try {
    preview.value = await api.previewDispatch({ ...filter })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Preview failed', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    previewing.value = false
  }
}

function openConfirm() {
  if (canSend.value)
    confirmOpen.value = true
}

async function runSend() {
  sending.value = true
  try {
    result.value = await api.sendDispatch({ filter: { ...filter }, subject: subject.value.trim(), body: body.value })
    confirmOpen.value = false
    preview.value = null
    toast.add({ title: `Sent ${result.value.sent} email(s)`, color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Dispatch failed', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <UPageCard
      title="Send email"
      description="Compose a message and dispatch it to a filtered set of users. Recipients who turned off email are skipped."
      variant="naked"
    />

    <!-- Recipients -->
    <UPageCard variant="subtle" :ui="{ container: 'flex flex-col gap-4' }">
      <UFormField label="All users" description="Send to every user (minus opt-outs)." class="flex items-center justify-between gap-2">
        <USwitch v-model="filter.allUsers" @update:model-value="resetPreview" />
      </UFormField>

      <template v-if="!filter.allUsers">
        <UFormField label="Organizations" description="Members of the selected organizations.">
          <USelectMenu
            v-model="filter.organizationIds"
            :items="orgItems"
            value-key="value"
            multiple
            searchable
            placeholder="Select organizations"
            class="w-full"
            @update:model-value="resetPreview"
          />
        </UFormField>

        <UFormField label="Roles" description="Users assigned the selected roles.">
          <USelectMenu
            v-model="filter.roleIds"
            :items="roleItems"
            value-key="value"
            multiple
            searchable
            placeholder="Select roles"
            class="w-full"
            @update:model-value="resetPreview"
          />
        </UFormField>

        <UFormField label="Emails" description="Specific addresses (one per line / comma-separated). Only matching users are emailed.">
          <UTextarea v-model="emailsText" :rows="3" placeholder="a@example.com, b@example.com" class="w-full" @update:model-value="resetPreview" />
        </UFormField>
      </template>
    </UPageCard>

    <!-- Message -->
    <UPageCard variant="subtle" :ui="{ container: 'flex flex-col gap-4' }">
      <UFormField label="Subject" required>
        <UInput v-model="subject" maxlength="200" placeholder="Subject" class="w-full" />
      </UFormField>
      <UFormField label="Body" required description="Rich text — formatting is preserved in the email.">
        <UEditor
          v-slot="{ editor }"
          v-model="body"
          content-type="html"
          placeholder="Write your message…"
          class="w-full min-h-48 rounded-md border border-default"
        >
          <UEditorToolbar :editor="editor" :items="toolbarItems" class="mb-2 border-b border-muted p-2" />
        </UEditor>
      </UFormField>
    </UPageCard>

    <!-- Actions + preview -->
    <div class="flex items-center gap-3">
      <UButton label="Preview recipients" variant="outline" :loading="previewing" :disabled="!hasCriteria" @click="runPreview" />
      <UButton label="Send email" icon="i-lucide-send" :disabled="!canSend" @click="openConfirm" />
    </div>

    <UAlert
      v-if="preview"
      color="info"
      variant="subtle"
      icon="i-lucide-users"
      :title="`${preview.enabled} will receive · ${preview.skipped} skipped (email off) · ${preview.total} matched`"
    />
    <UAlert
      v-if="result"
      :color="result.failed ? 'warning' : 'success'"
      variant="subtle"
      icon="i-lucide-mail-check"
      :title="`Sent ${result.sent}, failed ${result.failed}, skipped ${result.skipped} of ${result.total} matched`"
    />

    <!-- Confirm -->
    <UModal v-model:open="confirmOpen" title="Send this email?" :ui="{ footer: 'justify-end' }">
      <template #body>
        <p class="text-sm text-muted">
          This will email <strong>{{ preview ? preview.enabled : 'the matching' }}</strong> user(s).
          Recipients who disabled email notifications are skipped automatically.
        </p>
      </template>
      <template #footer>
        <UButton color="neutral" variant="ghost" label="Cancel" @click="confirmOpen = false" />
        <UButton color="primary" label="Send" :loading="sending" @click="runSend" />
      </template>
    </UModal>
  </div>
</template>

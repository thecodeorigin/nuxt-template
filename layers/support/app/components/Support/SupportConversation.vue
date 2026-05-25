<script setup lang="ts">
import type { TicketMessage } from '#layers/support/shared/schemas/ticket'

const props = defineProps<{
  messages: TicketMessage[]
  viewerRole: 'user' | 'agent'
  canReply?: boolean
  sending?: boolean
}>()
const emit = defineEmits<{ send: [body: string] }>()

const draft = ref('')

function submit() {
  const body = draft.value.trim()
  if (!body || props.sending)
    return
  emit('send', body)
  draft.value = ''
}

function isMine(m: TicketMessage) {
  return m.authorRole === props.viewerRole
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)
    return 'just now'
  if (m < 60)
    return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)
    return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto flex flex-col gap-3 p-4">
      <div
        v-for="m in props.messages"
        :key="m.id"
        class="flex"
        :class="isMine(m) ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[80%] rounded-lg px-3 py-2 text-sm"
          :class="isMine(m) ? 'bg-primary text-inverted' : 'bg-elevated text-default'"
        >
          <p class="whitespace-pre-wrap break-words">
            {{ m.body }}
          </p>
          <p class="mt-1 text-[10px] opacity-70">
            {{ m.authorRole === 'agent' ? 'Support' : 'You' }} · {{ timeAgo(m.createdAt) }}
          </p>
        </div>
      </div>
    </div>

    <form
      v-if="props.canReply"
      class="border-t border-default p-3 flex items-end gap-2"
      @submit.prevent="submit"
    >
      <UTextarea
        v-model="draft"
        :rows="2"
        autoresize
        placeholder="Write a reply…"
        class="flex-1"
        @keydown.enter.exact.prevent="submit"
      />
      <UButton
        type="submit"
        icon="i-lucide-send"
        :loading="props.sending"
        :disabled="!draft.trim()"
      />
    </form>
  </div>
</template>

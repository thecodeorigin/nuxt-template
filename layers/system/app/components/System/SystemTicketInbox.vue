<script setup lang="ts">
import type { TicketDetail, TicketStatus, TicketSummary } from '#layers/support/shared/schemas/ticket'
import SupportConversation from '#layers/support/app/components/Support/SupportConversation.vue'

import { useSystemTicketApi } from '#layers/system/app/api/useSystemTicketApi'

const api = useSystemTicketApi()
const toast = useToast()

const statusFilter = ref<TicketStatus | undefined>()
const kindFilter = ref<'feedback' | 'support' | undefined>()
const mineOnly = ref(false)

const statusItems = [
  { label: 'All statuses', value: undefined },
  { label: 'Open', value: 'open' },
  { label: 'Active', value: 'active' },
  { label: 'Closed', value: 'closed' },
]
const kindItems = [
  { label: 'All kinds', value: undefined },
  { label: 'Feedback', value: 'feedback' },
  { label: 'Support', value: 'support' },
]

const { data, error, refresh } = useAsyncData(
  'system-tickets',
  () => api.fetchTickets({ status: statusFilter.value, kind: kindFilter.value, mineOnly: mineOnly.value, limit: 50 }),
  { default: () => ({ items: [] as TicketSummary[], hasMore: false }), watch: [statusFilter, kindFilter, mineOnly], server: false },
)
whenError(error)

const selected = ref<TicketDetail | null>(null)
const sending = ref(false)

async function open(id: string) {
  selected.value = await api.fetchTicket(id)
}
async function reply(body: string) {
  if (!selected.value)
    return
  sending.value = true
  try {
    selected.value = await api.postMessage(selected.value.id, body)
    await refresh()
  }
  finally {
    sending.value = false
  }
}
async function setStatus(status: TicketStatus) {
  if (!selected.value)
    return
  selected.value = await api.updateTicket(selected.value.id, { status })
  await refresh()
  toast.add({ title: `Marked ${status}`, color: 'success' })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-2">
      <USelect v-model="statusFilter" :items="statusItems" value-key="value" class="w-40" />
      <USelect v-model="kindFilter" :items="kindItems" value-key="value" class="w-40" />
      <USwitch v-model="mineOnly" label="Assigned to me" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-14rem)]">
      <div class="lg:col-span-1 border border-default rounded-lg overflow-y-auto divide-y divide-default">
        <p v-if="data.items.length === 0" class="p-4 text-sm text-muted">
          No tickets.
        </p>
        <button
          v-for="t in data.items"
          :key="t.id"
          type="button"
          class="w-full text-left p-3 hover:bg-elevated/50"
          :class="selected?.id === t.id ? 'bg-elevated' : ''"
          @click="open(t.id)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="font-medium truncate">{{ t.subject }}</span>
            <UBadge size="xs" variant="subtle" :color="t.status === 'closed' ? 'neutral' : t.status === 'active' ? 'success' : 'warning'">
              {{ t.status }}
            </UBadge>
          </div>
          <p class="text-xs text-muted mt-1">
            {{ t.kind === 'feedback' ? 'Feedback' : t.category }}
            <span v-if="t.assignedTo"> · claimed</span>
          </p>
        </button>
      </div>

      <div class="lg:col-span-2 border border-default rounded-lg overflow-hidden flex flex-col">
        <template v-if="selected">
          <div class="flex items-center justify-between gap-2 border-b border-default p-3">
            <div class="min-w-0">
              <p class="font-medium truncate">
                {{ selected.subject }}
              </p>
              <p class="text-xs text-muted truncate">
                {{ selected.requester?.name ?? selected.requester?.email }}
              </p>
            </div>
            <div class="flex gap-2">
              <UButton size="xs" variant="soft" label="Active" :disabled="selected.status === 'active'" @click="setStatus('active')" />
              <UButton size="xs" variant="soft" color="neutral" label="Close" :disabled="selected.status === 'closed'" @click="setStatus('closed')" />
            </div>
          </div>
          <SupportConversation
            class="flex-1"
            :messages="selected.messages"
            viewer-role="agent"
            :can-reply="selected.status !== 'closed'"
            :sending="sending"
            @send="reply"
          />
        </template>
        <div v-else class="h-full grid place-items-center text-sm text-muted">
          Select a ticket to respond.
        </div>
      </div>
    </div>
  </div>
</template>

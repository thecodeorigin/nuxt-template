<script setup lang="ts">
import type { TicketDetail, TicketSummary } from '#layers/support/shared/schemas/ticket'
import { satisfiesAbility } from '#layers/auth/shared/ability'
import { useSupportApi } from '#layers/support/app/api/useSupportApi'
import SupportConversation from '#layers/support/app/components/Support/SupportConversation.vue'
import { supportTicketsKey } from '#layers/support/app/composables/useSupportTickets'

useHead({ title: 'My requests' })

const authStore = useAuthStore()
const abilities = authStore.currentUser?.abilities ?? []
if (satisfiesAbility(abilities, 'support:manage') || satisfiesAbility(abilities, 'system:manage')) {
  await navigateTo('/system/tickets')
}

const api = useSupportApi()
const route = useRoute()

const { data, error } = useAsyncData('support-tickets', () => api.fetchTickets({ limit: 50 }), {
  default: () => ({ items: [] as TicketSummary[], hasMore: false }),
})
whenError(error)

const tickets = computed(() => data.value.items)
const selected = ref<TicketDetail | null>(null)
const sending = ref(false)

async function selectTicket(id: string) {
  selected.value = await api.fetchTicket(id)
}
async function sendReply(body: string) {
  if (!selected.value)
    return
  sending.value = true
  try {
    selected.value = await api.postMessage(selected.value.id, body)
    await refreshNuxtData('support-tickets')
  }
  finally {
    sending.value = false
  }
}

onMounted(() => {
  const id = route.query.ticket as string | undefined
  const first = tickets.value[0]?.id
  if (id || first)
    selectTicket((id ?? first)!)
})

provide(supportTicketsKey, { tickets, selected, selectTicket, sendReply })
</script>

<template>
  <UDashboardPanel id="support">
    <template #header>
      <UDashboardNavbar title="My requests" />
    </template>
    <template #body>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
        <div class="lg:col-span-1 border border-default rounded-lg overflow-y-auto divide-y divide-default">
          <p v-if="tickets.length === 0" class="p-4 text-sm text-muted">
            No requests yet. Use Feedback or Help &amp; Support to start one.
          </p>
          <button
            v-for="t in tickets"
            :key="t.id"
            type="button"
            class="w-full text-left p-3 hover:bg-elevated/50"
            :class="selected?.id === t.id ? 'bg-elevated' : ''"
            @click="selectTicket(t.id)"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-medium truncate">{{ t.subject }}</span>
              <UBadge size="xs" variant="subtle" :color="t.status === 'closed' ? 'neutral' : t.status === 'active' ? 'success' : 'warning'">
                {{ t.status }}
              </UBadge>
            </div>
            <p class="text-xs text-muted mt-1">
              {{ t.kind === 'feedback' ? 'Feedback' : t.category }}
            </p>
          </button>
        </div>

        <div class="lg:col-span-2 border border-default rounded-lg overflow-hidden">
          <SupportConversation
            v-if="selected"
            :messages="selected.messages"
            viewer-role="user"
            :can-reply="selected.status !== 'closed'"
            :sending="sending"
            @send="sendReply"
          />
          <div v-else class="h-full grid place-items-center text-sm text-muted">
            Select a request to view the conversation.
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

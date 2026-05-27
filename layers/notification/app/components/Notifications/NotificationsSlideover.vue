<script setup lang="ts">
import { useNotificationStore } from '#layers/notifications/app/stores/notifications'

const store = useNotificationStore()
const open = computed({ get: () => store.isOpen, set: v => (store.isOpen = v) })

function initials(name: string) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime()
  const m = Math.floor(diff / 60_000)
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
  <USlideover v-model:open="open" title="Notifications">
    <template #body>
      <div v-if="store.items.length === 0 && !store.loading" class="text-center text-muted py-8">
        You're all caught up.
      </div>

      <div v-else class="flex flex-col gap-1 -mx-2">
        <UButton
          v-for="n in store.items"
          :key="n.id"
          color="neutral"
          variant="ghost"
          block
          class="justify-start py-2.5"
          @click="store.markRead(n.id)"
        >
          <div class="flex items-center gap-3 w-full text-left">
            <UChip color="error" :show="!n.isRead" inset>
              <UAvatar :alt="n.senderName" :text="initials(n.senderName)" size="md" />
            </UChip>
            <div class="text-sm flex-1 min-w-0">
              <p class="flex items-center justify-between gap-2">
                <span class="text-highlighted font-medium truncate">{{ n.senderName }}</span>
                <time :datetime="n.createdAt" class="text-muted text-xs shrink-0">
                  {{ timeAgo(n.createdAt) }}
                </time>
              </p>
              <div v-sanitize="n.body" class="text-dimmed truncate" />
            </div>
          </div>
        </UButton>

        <div v-if="store.hasMore" class="pt-2 px-2">
          <UButton
            block
            color="neutral"
            variant="soft"
            :loading="store.loading"
            data-testid="notifications-load-more"
            @click="store.loadMore()"
          >
            Load more
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

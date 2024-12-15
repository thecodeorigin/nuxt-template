<script setup lang="ts">
import { withQuery } from 'ufo'

const { isHelpSlideoverOpen } = useDashboard()
const { isDashboardSearchModalOpen } = useUIState()
const { metaSymbol } = useShortcuts()

const authStore = useAuthStore()

const items = computed(() => [
  [{
    slot: 'account',
    label: '',
    disabled: true,
  }],
  [{
    label: 'Settings',
    icon: 'i-heroicons-cog-8-tooth',
    to: '/settings',
  }, {
    label: 'Command menu',
    icon: 'i-heroicons-command-line',
    shortcuts: [metaSymbol.value, 'K'],
    click: () => {
      isDashboardSearchModalOpen.value = true
    },
  }, {
    label: 'Help & Support',
    icon: 'i-heroicons-question-mark-circle',
    shortcuts: ['?'],
    click: () => isHelpSlideoverOpen.value = true,
  }],
  [{
    label: 'Documentation',
    icon: 'i-heroicons-book-open',
    to: 'https://ui.nuxt.com/pro/getting-started',
    target: '_blank',
  }],
  [{
    label: 'Sign out',
    icon: 'i-heroicons-arrow-left-on-rectangle',
    click: () => {
      authStore.signOut()
    },
  }],
])
</script>

<template>
  <UDropdown
    mode="click"
    :items="items"
    :ui="{ width: 'w-full', item: { disabled: 'cursor-text select-text' } }"
    :popper="{ strategy: 'absolute', placement: 'top' }"
    class="w-full"
  >
    <template #default="{ open }">
      <UButton
        color="gray"
        variant="ghost"
        class="w-full"
        :class="[open && 'bg-gray-50 dark:bg-gray-800']"
      >
        <template #leading>
          <UAvatar
            :src="withQuery('https://ui-avatars.com/api', { name: authStore.currentUser?.name })"
            size="2xs"
          />
        </template>
        <p class="truncate">
          {{ authStore.currentUser?.name || authStore.currentUser?.email || authStore.currentUser?.username || '' }}
        </p>
        <template #trailing>
          <UIcon
            name="i-heroicons-ellipsis-vertical"
            class="w-5 h-5 ml-auto"
          />
        </template>
      </UButton>
    </template>

    <template #account>
      <div class="text-left w-full">
        <p>
          Signed in as
        </p>
        <p class="truncate font-medium text-gray-900 dark:text-white w-full">
          {{ authStore.currentUser?.email || authStore.currentUser?.username }}
        </p>
      </div>
    </template>
  </UDropdown>
</template>

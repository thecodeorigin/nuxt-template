<script setup lang="ts">
import { getMessaging, getToken } from 'firebase/messaging'
import { quickActionBusKey } from '@base/injections/layout'

definePageMeta({
  layout: 'app',
  auth: true,
})

const config = useRuntimeConfig()

const tokenDevice = useLocalStorage<string | null>('tokenDevice', null)

const { isNotificationsSlideoverOpen } = useDashboard()

const { credit, isRefreshingCredit, refreshCredit } = useCredit()

const quickActionBus = useEventBus(quickActionBusKey)

const notificationApi = useApiNotification()

onMounted(async () => {
  if (!isInAppBrowser() && !tokenDevice.value) {
    try {
      if (Notification.permission !== 'granted')
        await Notification.requestPermission()

      const currentUser = useLogtoUser()

      if (Notification.permission === 'granted' && currentUser) {
        const token = await getToken(getMessaging(), { vapidKey: config.public.firebase.keyPair })

        notificationApi.createTokenDevice(token)
      }
    }
    catch {}
  }
})

const route = useRoute()

const links = [
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/app/settings/profile',
    },
    {
      label: 'Billing',
      icon: 'i-lucide-credit-card',
      to: '/app/settings/billing',
    },
    {
      label: 'Notifications',
      icon: 'i-lucide-bell',
      to: '/app/settings/notifications',
    },
    {
      label: 'Security',
      icon: 'i-lucide-shield',
      to: '/app/settings/security',
    },
  ],
  [
    {
      label: 'Documentation',
      icon: 'i-lucide-book-open',
      to: '/docs',
      target: '_blank',
    },
  ],
]
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <span class="inline-flex items-center mr-4">
            Credits: <strong class="ml-2">{{ credit }}</strong>

            <UIcon
              name="i-heroicons-arrow-path"
              class="ml-1 cursor-pointer"
              :class="{ 'animate-spin': isRefreshingCredit }"
              @click="refreshCredit"
            />
          </span>

          <UTooltip text="Create new instance" :popper="{ placement: 'right' }">
            <UButton
              trailing-icon="i-heroicons-plus"
              color="neutral"
              @click="quickActionBus.emit()"
            >
              Create
            </UButton>
          </UTooltip>
        </template>
      </UDashboardNavbar>

      <!-- TODO: there's gotta be some more dynamic way hmm -->
      <UDashboardToolbar v-if="route.meta.toolbar">
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <NuxtPage />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { getMessaging, getToken } from 'firebase/messaging'

definePageMeta({
  layout: 'app',
  auth: true,
})

const config = useRuntimeConfig()

const tokenDevice = useLocalStorage<string | null>('tokenDevice', null)

const { isNotificationsSlideoverOpen } = useDashboard()

const { credit, isRefreshingCredit, refreshCredit } = useCredit()

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

const isTopupModalVisible = ref(false)

const { data: plans } = useAsyncData('credit-packages', () => useApiCreditPackage().fetchCreditPackages(), {
  transform(data) {
    return data.data.reduce((acc, item) => {
      if (Number(item.amount) > 0) {
        acc.push({
          ...item,
          features: [],
        })
      }

      return acc
    }, [] as CreditPackage[])
  },
})

const selectedPriceId = ref(plans.value?.[1]?.id || null)
const selectedPrice = computed(() => plans.value?.find((plan: any) => plan.id === selectedPriceId.value))

const paymentApi = useApiPayment()

async function handleCheckout() {
  const productIdentifier = `credit:${selectedPriceId.value}`

  const { data: checkoutData } = await paymentApi.checkout('payos', productIdentifier)

  window.open(checkoutData.paymentUrl, '_blank')
}
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
              name="i-lucide-refresh-cw"
              class="ml-1 cursor-pointer"
              :class="{ 'animate-spin': isRefreshingCredit }"
              @click="refreshCredit"
            />
          </span>

          <UTooltip text="Add more credit to your account" :popper="{ placement: 'right' }">
            <UButton
              trailing-icon="i-lucide-diamond-plus"
              color="neutral"
              @click="isTopupModalVisible = true"
            >
              Add Credit
            </UButton>
          </UTooltip>

          <UModal
            v-model:open="isTopupModalVisible"
            title="Topup credit to your account"
            :ui="{
              content: 'w-full max-w-3xl',
            }"
          >
            <template #body>
              <UFormField
                description="Get started by selecting a credit package."
                help="It's recommended to topup twice the amount of your instance monthly consumption."
                size="xl"
              >
                <div class="flex items-center space-x-4">
                  <USelect
                    v-model="selectedPriceId"
                    :items="plans || []"
                    value-key="id"
                    label-key="title"
                    size="xl"
                    placeholder="Select a credit package"
                    class="flex-1"
                  >
                    <template #item="{ item }">
                      {{ item.title }}

                      <span class="text-gray-500">{{ formatPrice(Number(item.price), item.currency) }} / {{ item.amount }} credits</span>
                    </template>
                  </USelect>

                  <UButton id="topup" size="lg" color="neutral" trailing-icon="i-lucide-rocket" @click="handleCheckout">
                    <b>Buy {{ Number(selectedPrice?.amount) }} credits</b>
                    ({{ formatPrice(Number(selectedPrice?.price), selectedPrice?.currency || 'vi') }})
                  </UButton>
                </div>
              </UFormField>
            </template>
          </UModal>
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

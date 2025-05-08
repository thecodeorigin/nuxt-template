<script setup lang="ts">
import { getMessaging, getToken } from 'firebase/messaging'
import { topupBusKey } from '@base/injections/credit'

definePageMeta({
  layout: 'app',
  auth: true,
})
const { t } = useI18n()
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

      const authStore = useAuthStore()

      if (Notification.permission === 'granted' && authStore.currentUser) {
        const token = await getToken(getMessaging(), { vapidKey: config.public.firebase.keyPair })

        notificationApi.createTokenDevice(token)
      }
    }
    catch {}
  }

  refreshCredit()
})

const route = useRoute()

const links = [
  [
    {
      label: t('Profile'),
      icon: 'i-lucide-user',
      to: '/app/settings/profile',
    },
    {
      label: t('Billing'),
      icon: 'i-lucide-credit-card',
      to: '/app/settings/billing',
    },
    {
      label: t('Notifications'),
      icon: 'i-lucide-bell',
      to: '/app/settings/notifications',
    },
    {
      label: t('Security'),
      icon: 'i-lucide-shield',
      to: '/app/settings/security',
    },
  ],
  [
    {
      label: t('Documentation'),
      icon: 'i-lucide-book-open',
      to: '/docs',
      target: '_blank',
    },
  ],
]

const isTopupModalVisible = ref(false)

const topupBus = useEventBus(topupBusKey)

topupBus.on(() => {
  isTopupModalVisible.value = true
})

const { data: plans } = useAsyncData('products', () => useApiProduct().fetchProducts(), {
  transform(data) {
    return data.data.reduce((acc, item) => {
      if (item.amount > 0) {
        acc.push({
          ...item,
          features: [],
        })
      }

      return acc
    }, [] as Product[])
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
            {{ $t('Credits') }}: <strong class="ml-2">{{ credit }}</strong>

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
              {{ $t('Add Credit') }}
            </UButton>
          </UTooltip>

          <UModal
            v-model:open="isTopupModalVisible"
            :title="$t('Topup credit to your account')"
            :ui="{
              content: 'w-full !max-w-3xl',
            }"
          >
            <template #body>
              <UFormField
                :description="$t('Get started by selecting a credit package.')"
                :help="$t('It\'s recommended to topup twice the amount of your instance monthly consumption.')"
                size="xl"
              >
                <div class="flex md:flex-row flex-col items-center gap-2">
                  <USelect
                    v-model="selectedPriceId"
                    :items="plans || []"
                    value-key="id"
                    label-key="title"
                    size="xl"
                    :placeholder="$t('Select a credit package')"
                    class="flex-1 md:w-auto w-full"
                  >
                    <template #item="{ item }">
                      <span class="text-gray-500">
                        <template v-if="item.price_discount">
                          {{ formatPrice(Number(item.price_discount), item.currency) }}
                          / {{ item.amount }} {{ $t('credits') }}

                          <UBadge class="line-through ml-2">Giá gốc:{{ formatPrice(Number(item.price), item.currency) }}</UBadge>
                        </template>
                        <template v-else>
                          {{ formatPrice(Number(item.price), item.currency) }}
                          / {{ item.amount }} {{ $t('credits') }}

                        </template>
                      </span>
                    </template>
                  </USelect>

                  <UButton id="topup" size="lg" color="neutral" trailing-icon="i-lucide-rocket" class="md:w-auto w-full" @click="handleCheckout">
                    <b>
                      {{ $t('Buy') }} {{ selectedPrice?.amount || 0 }} credits
                    </b>
                    <template v-if="selectedPrice?.price_discount">
                      (<span class="line-through">{{ formatPrice(Number(selectedPrice?.price || 0), selectedPrice?.currency || 'VND') }}</span>
                      {{ formatPrice(Number(selectedPrice?.price_discount || 0), selectedPrice?.currency || 'VND') }})
                    </template>
                    <template v-else>
                      ({{ formatPrice(Number(selectedPrice?.price || 0), selectedPrice?.currency || 'VND') }})
                    </template>
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

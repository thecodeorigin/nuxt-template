<script setup lang="ts">
import { useTheme } from 'vuetify'
import { getMessaging, getToken } from 'firebase/messaging'
import ScrollToTop from '@base/@core/components/ScrollToTop.vue'
import initCore from '@base/@core/initCore'
import { initConfigStore, useConfigStore } from '@base/@core/stores/config'
import { hexToRgb } from '@base/@core/utils/colorConverter'
import { isInAppBrowser } from '@base/utils/browser'

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()
const configStore = useConfigStore()

const { isMobile } = useDevice()
const { global } = useTheme()

if (isMobile)
  configStore.appContentLayoutNav = 'vertical'

const config = useRuntimeConfig()

const tokenDevice = useLocalStorage<string | null>('tokenDevice', null)

const notificationApi = useApiNotification()

onMounted(async () => {
  if (!isInAppBrowser() && !tokenDevice.value) {
    try {
      if (Notification.permission !== 'granted')
        await Notification.requestPermission()

      const authStore = useAuthStore()

      whenever(() => authStore.currentUser, async (currentUser) => {
        if (Notification.permission === 'granted' && currentUser) {
          const token = await getToken(getMessaging(), { vapidKey: config.public.firebase.keyPair })

          notificationApi.createTokenDevice(token)
        }
      })
    }
    catch {}
  }
})
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <NuxtLoadingIndicator />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>

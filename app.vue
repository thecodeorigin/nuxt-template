<script setup lang="ts">
import { useTheme } from 'vuetify'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@layouts/utils'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const { currentUser } = useAuthStore()
const tokenDeviceStore = useTokenDeviceStore()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()
const configStore = useConfigStore()
const { isMobile } = useDevice()
const config = useRuntimeConfig()
const { global } = useTheme()

if (isMobile)
  configStore.appContentLayoutNav = 'vertical'

const notificationStore = useNotificationStore()
const layoutStore = useLayoutStore()
onMounted(() => {
  Notification.requestPermission()
    .then(async (permission) => {
      if (permission === 'granted') {
        const messaging = getMessaging()
        const token = await getToken(messaging, { vapidKey: config.public.FB_KEY_PAIR })
        if (currentUser) {
          try {
            await tokenDeviceStore.setTokenDevice(token)
          }
          catch (error) {
            console.log('setTokenDevice error:', error)
          }
        }
      }
    })
    .catch((error) => {
      console.log('Notification.requestPermission error:', error)
    })

  onMessage(getMessaging(), (payload) => {
    // TODO: Handle incoming messages
    console.log('Client message:', payload)
  })
})
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <ScrollToTop />

      <VOverlay
        :model-value="layoutStore.isLoading"
        contained
        persistent
        scroll-strategy="none"
        class="align-center justify-center"
      >
        <VProgressCircular indeterminate />
      </VOverlay>

      <VSnackbar
        v-bind="notificationStore.notificationProps"
      >
        {{ notificationStore.notificationMessage }}
      </VSnackbar>
    </VApp>
  </VLocaleProvider>
</template>

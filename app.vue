<script setup lang="ts">
import { useTheme } from 'vuetify'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@layouts/utils'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()
const config = useRuntimeConfig()

const configStore = useConfigStore()
const authStore = useAuthStore()
const tokenDeviceStore = useTokenDeviceStore()
const { status } = useAuth()
const { isMobile } = useDevice()
const { global } = useTheme()

if (isMobile)
  configStore.appContentLayoutNav = 'vertical'

const notificationStore = useNotificationStore()
const layoutStore = useLayoutStore()

onBeforeMount(async () => {
  if (status.value === 'authenticated') {
    try {
      if (Notification.permission !== 'granted')
        await Notification.requestPermission()

      if (Notification.permission === 'granted' && authStore.currentUser) {
        const messaging = getMessaging()
        const token = await getToken(messaging, { vapidKey: config.public.FIREBASE_KEY_PAIR })
        await tokenDeviceStore.setTokenDevice(token)
      }
    }
    catch (error) {
      console.log('Error:', error)
    }

    onMessage(getMessaging(), (payload) => {
      // TODO: Handle incoming messages
      console.log('Client message:', payload)
    })
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
      <ConfirmDialog
        :model-value="Boolean(notificationStore.confirmationMessage)"
        :message="notificationStore.confirmationMessage"
        @confirm="notificationStore.resolveConfirmation"
      />
    </VApp>
  </VLocaleProvider>
</template>

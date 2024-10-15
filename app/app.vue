<script setup lang="ts">
import { useTheme } from 'vuetify'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import ScrollToTop from '@base/@core/components/ScrollToTop.vue'
import initCore from '@base/@core/initCore'
import { initConfigStore, useConfigStore } from '@base/@core/stores/config'
import { hexToRgb } from '@base/@core/utils/colorConverter'

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

const notificationStore = useMessageStore()
const layoutStore = useLayoutStore()

onBeforeMount(async () => {
  if (status.value === 'authenticated') {
    try {
      if (Notification.permission !== 'granted')
        await Notification.requestPermission()

      if (Notification.permission === 'granted' && authStore.currentUser) {
        const messaging = getMessaging()
        const token = await getToken(messaging, { vapidKey: config.public.firebase.keyPair })
        await tokenDeviceStore.setTokenDevice(token)
      }
    }
    catch (error) {
      console.log('Error:', error)
    }
  }
  onMessage(getMessaging(), (payload) => {
    // TODO: Handle incoming messages
    // console.log('Client message:', payload)
    const linkSplits = payload.fcmOptions?.link?.split('/projects/')
    notify(payload.notification?.body as string, { type: 'primary', link: `/projects/${linkSplits![1]}` })
  })
})
function handleClick() {
  if (notificationStore.notificationProps.link)
    navigateTo(notificationStore.notificationProps.link)
}
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
        :style="{ cursor: notificationStore.notificationProps.link ? 'pointer' : 'default' }"
        @click="handleClick"
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

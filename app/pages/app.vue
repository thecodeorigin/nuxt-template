<script setup lang="ts">
import { getMessaging, getToken } from 'firebase/messaging'
import { isInAppBrowser } from '@base/utils/detectBrowser'

definePageMeta({
  layout: 'app',
  auth: true,
})

const tokenDeviceStore = useTokenDeviceStore()

const config = useRuntimeConfig()

onMounted(async () => {
  if (!isInAppBrowser() && !tokenDeviceStore.tokenDevice) {
    try {
      if (Notification.permission !== 'granted')
        await Notification.requestPermission()

        const currentUser = useLogtoUser()

      if (Notification.permission === 'granted' && currentUser) {
        const messaging = getMessaging()
        const token = await getToken(messaging, { vapidKey: config.public.firebase.keyPair })
        await tokenDeviceStore.setTokenDevice(token)
      }
    }
    catch {}
  }
})
</script>

<template>
  <NuxtPage />
</template>

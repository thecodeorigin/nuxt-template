<script setup lang="ts">
import { getMessaging, getToken } from 'firebase/messaging'
import { isInAppBrowser } from '@base/utils/detectBrowser'

definePageMeta({
  layout: 'app',
  auth: true,
})

const config = useRuntimeConfig()

const tokenDevice = useLocalStorage<string | null>('tokenDevice', null)

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
</script>

<template>
  <NuxtPage />
</template>

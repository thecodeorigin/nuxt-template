import { isInAppBrowser } from '@/utils/detectBrowser'
import { getMessaging, getToken } from 'firebase/messaging'

export default defineNuxtPlugin({
  dependsOn: ['healthcheck'],
  setup(nuxtApp) {
    const healthStore = useHealthStore()
    const tokenDeviceStore = useTokenDeviceStore()

    const config = useRuntimeConfig()

    nuxtApp.hook('app:mounted', async () => {
      if (healthStore.isHealthy && !isInAppBrowser()) {
        const user = useLogtoUser()

        if (!user)
          return

        try {
          if (Notification.permission !== 'granted')
            await Notification.requestPermission()

          if (Notification.permission === 'granted' && authStore.currentUser) {
            const messaging = getMessaging()
            const token = await getToken(messaging, { vapidKey: config.public.firebase.keyPair })
            await tokenDeviceStore.setTokenDevice(token)
          }
        }
        catch {}
      }
    })
  },
})

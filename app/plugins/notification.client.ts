import { getMessaging, getToken } from 'firebase/messaging'
import { isInAppBrowser } from '@base/utils/detectBrowser'

export default defineNuxtPlugin({
  setup(nuxtApp) {
    const authStore = useAuthStore()
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

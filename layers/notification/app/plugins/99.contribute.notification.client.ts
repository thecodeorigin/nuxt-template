import NotificationsBell from '#layers/notification/app/components/Notifications/NotificationsBell.vue'
import NotificationsSlideover from '#layers/notification/app/components/Notifications/NotificationsSlideover.vue'

export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navbarItems: [
      { id: 'notifications-bell', component: NotificationsBell, priority: 10 },
    ],
    overlays: [
      { id: 'notifications-slideover', component: NotificationsSlideover },
    ],
  })
})

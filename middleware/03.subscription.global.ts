export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const subscriptionStore = useSubscriptionStore()

  if (authStore.isAuthenticated) {
    if (!subscriptionStore.currentSubscription)
      await subscriptionStore.fetchSubscriptions()

    if (to.name !== 'settings-tab') {
      if (!subscriptionStore.isSubscriptionValid) {
        return navigateTo({ name: 'settings-tab', params: { tab: 'billing-plans' } })
      }
    }
  }
})

export default defineNuxtRouteMiddleware(async (to) => {
  const subscriptionStore = useSubscriptionStore()
  if (!subscriptionStore.currentSubscription) {
    await subscriptionStore.fetchSubscriptions()
  }

  if (to.name !== 'settings-tab') {
    if (!subscriptionStore.isSubscriptionValid) {
      return navigateTo({ name: 'settings-tab', params: { tab: 'billing-plans' } })
    }
  }
})

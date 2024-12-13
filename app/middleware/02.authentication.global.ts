export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  const authStore = useAuthStore()

  if (to.meta.auth && !authStore.isAuthenticated)
    return navigateTo({ path: '/sign-in' })
})

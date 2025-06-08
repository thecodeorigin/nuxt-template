export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  const authStore = useAuthStore()

  if (to.meta.unauthenticatedOnly && authStore.currentUser) {
    return navigateTo({ path: '/dashboard' })
  }

  if (to.meta.auth || to.meta.auth === undefined) {
    try {
      await authStore.fetchProfile()
    }
    catch {}

    if (!authStore.currentUser) {
      return navigateTo({ path: '/auth/login' })
    }
  }
})

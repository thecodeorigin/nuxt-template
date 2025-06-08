export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  const authStore = useAuthStore()

  try {
    await authStore.fetchProfile()
  }
  catch {}

  if (to.meta.unauthenticatedOnly && authStore.currentUser) {
    return navigateTo({ path: '/dashboard' })
  }

  if (to.meta.auth || to.meta.auth === undefined) {
    if (!authStore.currentUser) {
      return navigateTo({ path: '/auth/login' })
    }
  }
})

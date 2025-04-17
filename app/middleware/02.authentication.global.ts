export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  if (to.meta.auth) {
    const authStore = useAuthStore()

    if (!authStore.currentUser) {
      return navigateTo({ path: '/sign-in' }, { external: true })
    }
  }
})

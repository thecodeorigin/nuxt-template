export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  if (to.meta.auth || to.meta.auth === undefined) {
    const authStore = useAuthStore()

    if (authStore.currentUser) {
      if (to.meta.unauthenticatedOnly)
        return navigateTo('/')

      try {
        await authStore.fetchToken()
      }
      catch {
        notifyError({
          content: 'Failed to retrieve user token.',
        })
      }
    }
    else if (!to.meta.unauthenticatedOnly) {
      return navigateTo('/auth/login')
    }
  }
})

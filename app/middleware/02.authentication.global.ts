export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  if (to.meta.auth) {
    const authStore = useAuthStore()

    if (authStore.currentUser) {
      try {
        await authStore.fetchToken()
      }
      catch {
        notifyError({
          content: 'Failed to retrieve user token.',
        })
      }
    }
    else {
      return authStore.signIn()
    }
  }
})

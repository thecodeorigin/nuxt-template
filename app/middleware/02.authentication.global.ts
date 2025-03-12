export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  if (to.meta.auth) {
    const authStore = useAuthStore()

    const currentUser = useLogtoUser()

    if (!currentUser) {
      return authStore.signIn()
    }
  }
})

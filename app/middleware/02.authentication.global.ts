export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  const authStore = useAuthStore()

  if (to.meta.auth && !authStore.currentUser)
    return authStore.signIn()
})

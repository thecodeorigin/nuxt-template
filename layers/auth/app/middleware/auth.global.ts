export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.currentUser) {
    try {
      await authStore.fetchCurrentUser()
    }
    catch {
      // session invalid; treat as unauthenticated
    }
  }

  const isAuthenticated = !!authStore.currentUser
  const isPublic = to.meta.public === true || to.meta.unauthenticatedOnly === true

  if (isAuthenticated && to.meta.unauthenticatedOnly) {
    return navigateTo('/dashboard')
  }

  if (!isAuthenticated && !isPublic) {
    return navigateTo('/api/auth/oidc', { external: true })
  }
})

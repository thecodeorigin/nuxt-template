export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.currentUser) {
    try {
      await authStore.fetchCurrentUser()
    }
    catch {
      await authStore.logout()
    }
  }

  const publicRoutes = ['/terms', '/privacy', '/auth/login']
  const isPublic = publicRoutes.some(route => to.path.startsWith(route) || to.path === '/')

  if (!authStore.currentUser && !isPublic) {
    return navigateTo('/auth/login')
  }

  if (authStore.currentUser && to.path === '/auth/login') {
    return navigateTo('/dashboard')
  }
})

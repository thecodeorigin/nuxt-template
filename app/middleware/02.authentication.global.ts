export default defineNuxtRouteMiddleware(async (to) => {
  /*
     * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
     * Examples of public routes are, 404, under maintenance, etc.
     */
  if (to.meta.public)
    return

  const authStore = useAuthStore()

  if (authStore.isAuthenticated || to.query.loggedIn) {
    try {
      await authStore.getCurrentUser()
    }
    catch {}
  }

  if (authStore.isAuthenticated) {
    if (!authStore.currentUser?.id) {
      await authStore.signOut({ callbackUrl: '/auth/login' })
    }
    else if (to.meta.unauthenticatedOnly) {
      return navigateTo('/')
    }
  }
  else if (!to.meta.unauthenticatedOnly && to.name !== 'auth-login') {
    return navigateTo({
      name: 'auth-login',
      query: {
        ...to.query,
        to: to.fullPath !== '/' ? to.path : undefined,
      },
    })
  }
})

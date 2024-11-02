export default defineNuxtRouteMiddleware(async (to) => {
  /*
     * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
     * Examples of public routes are, 404, under maintenance, etc.
     */
  if (to.meta.public)
    return

  const authStore = useAuthStore()

  const { signOut } = useAuth()
  if (authStore.isAuthenticated) {
    if (!authStore.currentUser?.id) {
      await signOut({ redirect: false })
    }
    else if (to.meta.unauthenticatedOnly) {
      return navigateTo('/')
    }
  }
  else if (!to.meta.unauthenticatedOnly && to.name !== 'auth-login') {
    const filteredQuery = Object.entries(to.query)
      .filter(([key]) => key !== 'to')
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    const fullPath = filteredQuery ? `${to.path}?${filteredQuery}` : to.path

    return navigateTo({
      name: 'auth-login',
      query: {
        to: to.fullPath !== '/' ? fullPath : undefined,
      },
    })
  }
})

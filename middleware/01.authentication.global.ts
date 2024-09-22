export default defineNuxtRouteMiddleware(async (to) => {
  /*
     * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
     * Examples of public routes are, 404, under maintenance, etc.
     */
  if (to.meta.public)
    return

  const { signOut } = useAuth()

  const authStore = useAuthStore()

  if (authStore.isAuthenticated && !authStore.currentUser?.id)
    await signOut({ redirect: false })

  if (authStore.isAuthenticated && Boolean(to.meta.unauthenticatedOnly))
    return navigateTo('/')

  if (!authStore.isAuthenticated && to.name !== 'auth-login') {
    return navigateTo({
      name: 'auth-login',
      query: {
        ...to.query,
        to: to.fullPath !== '/' ? to.path : undefined,
      },
    })
  }
})

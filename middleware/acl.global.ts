import { canNavigate } from '@layouts/plugins/casl'

export default defineNuxtRouteMiddleware((to) => {
  /*
     * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
     * Examples of public routes are, 404, under maintenance, etc.
     */
  if (to.meta.public)
    return

  const { status } = useAuth()
  const isLoggedIn = status.value === 'authenticated'

  if (to.meta.unauthenticatedOnly) {
    if (isLoggedIn)
      return navigateTo('/')
    else
      return
  }

  if (!canNavigate(to) && to.matched.length) {
    return navigateTo(isLoggedIn
      ? { name: 'not-authorized' }
      : {
          name: 'auth-login',
          query: {
            ...to.query,
            to: to.fullPath !== '/' ? to.path : undefined,
          },
        })
  }
})

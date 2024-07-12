import { canNavigate } from '@layouts/plugins/casl'
import { P, match } from 'ts-pattern'

export default defineNuxtRouteMiddleware((to) => {
  /*
     * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
     * Examples of public routes are, 404, under maintenance, etc.
     */
  if (to.meta.public)
    return

  const { status } = useAuth()

  return match([status.value, to.meta.unauthenticatedOnly, canNavigate(to), to.name])
    .with(['unauthenticated', P.any, P.any, P.not('auth-login')], () => {
      return navigateTo({
        name: 'auth-login',
        query: {
          ...to.query,
          to: to.fullPath !== '/' ? to.path : undefined,
        },
      })
    })
    .with(['authenticated', true, true, P.any], () => {
      return navigateTo('/')
    })
    .with(['authenticated', P.any, false, P.any], () => {
      return navigateTo({ name: 'not-authorized' })
    })
    .with([P.any, P.any, P.any, P.any], () => {})
    .exhaustive()
})

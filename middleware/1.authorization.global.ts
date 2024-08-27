import { canNavigate } from '@/@layouts/plugins/casl'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  if (!canNavigate(to))
    return navigateTo({ name: 'error-not-authorized' })
})

import { canNavigate } from '@base/@layouts/plugins/casl'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  const config = useRuntimeConfig()

  if (!config.features.authorization)
    return

  if (!canNavigate(to)) {
    throw createError({
      statusCode: 403,
    })
  }
})

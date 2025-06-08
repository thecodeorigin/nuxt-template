export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public || import.meta.prerender)
    return

  try {
    await useApiHealth().fetchHealthCheck()
  }
  catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
    })
  }
})

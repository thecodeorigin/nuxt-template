export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public || import.meta.prerender)
    return

  const healthStore = useHealthStore()

  try {
    await healthStore.fetchHealthCheck()
  }
  catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
    })
  }
})

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public)
    return

  const healthStore = useHealthStore()

  await healthStore.fetchHealthCheck()

  if (!healthStore.isHealthy) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
    })
  }
})

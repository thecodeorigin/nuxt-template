export default defineNuxtRouteMiddleware(() => {
  const healthStore = useHealthStore()

  if (!healthStore.isHealthy) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
    })
  }
})

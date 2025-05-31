import type { H3Event } from 'h3'

const EXCLUDED_PATHS = ['/api/health']

export default defineNitroPlugin(async (nitroApp) => {
  // Create a request logger function
  const logRequest = logger.createRequestLogger()

  // Hook into each request
  nitroApp.hooks.hook('request', async (event: H3Event) => {
    if (!EXCLUDED_PATHS.includes(event.path))
      await logRequest(event)
  })
})

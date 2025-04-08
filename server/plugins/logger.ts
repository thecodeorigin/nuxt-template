import type { H3Event } from 'h3'

export default defineNitroPlugin(async (nitroApp) => {
  // Create a request logger function
  const logRequest = logger.createRequestLogger()

  // Hook into each request
  nitroApp.hooks.hook('request', async (event: H3Event) => {
    await logRequest(event)
  })
})

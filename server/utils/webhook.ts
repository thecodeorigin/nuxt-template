import type { H3Event } from 'h3'
import { createError, defineEventHandler, getHeader } from 'h3'

export function defineWebhookHandler(handler: (event: H3Event) => Promise<any>) {
  const runtimeConfig = useRuntimeConfig()

  return defineEventHandler(async (event) => {
    const signature = getHeader(event, 'X-Signature')

    if (runtimeConfig.webhookSigningSecret && signature !== runtimeConfig.webhookSigningSecret) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    return handler(event)
  })
}

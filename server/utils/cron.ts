import type { H3Event } from 'h3'

export function defineAuthenticatedCronHandler(handler: (event: H3Event) => Promise<any>) {
  const runtimeConfig = useRuntimeConfig()

  return defineEventHandler(async (event) => {
    const authHeader = getHeader(event, 'Authorization')

    if (runtimeConfig.taskSecret && authHeader !== `Bearer ${runtimeConfig.taskSecret}`) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    return handler(event)
  })
}

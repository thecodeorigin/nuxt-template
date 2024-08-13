import type { H3Event } from 'h3'

export function getParam(event: H3Event, key = 'uuid') {
  const value = getRouterParam(event, key)

  if (!value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found!',
    })
  }

  return value
}

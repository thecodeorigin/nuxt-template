import type { H3Event } from 'h3'

export function getUuid(event: H3Event) {
  const uuid = String(event.context.params?.uuid)

  if (!uuid) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found!',
    })
  }

  return uuid
}

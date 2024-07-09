import type { H3Event } from 'h3'

export const getUuid = (event: H3Event, msg404 = 'UUID is required to get information!') => {
  const uuid = String(event.context.params?.uuid)

  if (!uuid) {
    throw createError({
      statusCode: 404,
      statusMessage: msg404,
    })
  }

  return uuid
}

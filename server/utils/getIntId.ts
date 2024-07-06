import type { H3Event } from 'h3'

export const getIntId = (event: H3Event, msg404 = 'Id is required to get item details') => {
  const id = Number(event.context.params?.id)

  if (!id || !Number.isInteger(id)) {
    throw createError({
      statusCode: 404,
      statusMessage: msg404,
    })
  }

  return id
}

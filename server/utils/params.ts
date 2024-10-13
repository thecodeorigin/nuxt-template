import type { H3Event } from 'h3'
import { template } from 'lodash-es'

export function getParam(event: H3Event, key = 'uuid') {
  const value = getRouterParam(event, key)

  if (!value) {
    throw createError({
      statusCode: 404,
      statusMessage: template(ErrorMessage.INVALID_PARAMS)({ key, value }),
    })
  }

  return value
}

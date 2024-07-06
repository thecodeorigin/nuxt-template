import type { H3Event } from 'h3'
import { getServerSession } from '#auth'

export async function setAuthOnlyRoute(event: H3Event, statusMessage: string = 'You must be signed in to access this API.') {
  const session = await getServerSession(event)

  if (!session) {
    throw createError({
      statusCode: 403,
      statusMessage,
    })
  }

  return session
}

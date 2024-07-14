import type { H3Event } from 'h3'
import { getServerSession } from '#auth'

export async function setAuthOnlyRoute(event: H3Event) {
  const session = await getServerSession(event)

  if (!session) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized!',
    })
  }

  return session
}

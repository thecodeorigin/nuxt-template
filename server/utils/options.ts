import type { H3Event } from 'h3'
import type { Session } from 'next-auth'
import { getServerSession } from '#auth'

interface RouteOptions<T extends boolean, U extends boolean> {
  auth?: U
  detail?: T
}

type ConditionalType<Condition, TrueType, FalseType> = Condition extends true ? TrueType : FalseType

export async function defineEventOptions<
  UseDetailT extends boolean,
  UseAuthU extends boolean,
>(event: H3Event, options?: RouteOptions<UseDetailT, UseAuthU>) {
  type UUIDType = ConditionalType<UseDetailT, string, null>
  type SessionType = ConditionalType<UseAuthU, Session, null>

  const result = { uuid: null, session: null } as {
    uuid: UUIDType
    session: SessionType
  }

  if (options?.auth) {
    const session = await getServerSession(event)

    if (!session) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Unauthorized!',
      })
    }

    result.session = session as SessionType
  }

  if (options?.detail) {
    const uuid = getUuid(event)

    result.uuid = uuid as UUIDType
  }

  return result
}

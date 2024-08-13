import type { H3Event } from 'h3'
import type { Session } from 'next-auth'
import { getServerSession } from '#auth'

interface RouteOptions<U extends boolean, P extends string[]> {
  auth?: U
  params?: P
}

type ConditionalType<Condition, TrueType, FalseType> = Condition extends true ? TrueType : FalseType

type TupleType<T extends string[]> = [...T]

export async function defineEventOptions<
  UseAuthU extends boolean,
  ParamsT extends string[],
>(event: H3Event, options?: RouteOptions<UseAuthU, TupleType<ParamsT>>) {
  type SessionType = ConditionalType<UseAuthU, Session, null>

  type Result = {
    [K in TupleType<ParamsT>[number]]: string
  } & {
    session: SessionType
  }

  const result = { session: null } as Result

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

  if (options?.params) {
    for (const param of options.params) {
      result[param] = getParam(event, param) as any
    }
  }

  return result
}

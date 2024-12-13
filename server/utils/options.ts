import type { H3Event } from 'h3'
import { useLogtoUser } from '#imports'
import { z } from 'zod'

type Session = any

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
    const user = useLogtoUser()

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.DONOT_HAVE_PERMISSION,
      })
    }

    result.session = user as SessionType
  }

  if (options?.params) {
    for (const param of options.params) {
      result[param] = getParam(event, param) as any

      if (param.endsWith('UId'))
        z.string().uuid().parse(result[param])
    }
  }

  return result
}

import type { PgTable } from 'drizzle-orm/pg-core'
import type { EventHandlerRequest, H3Event } from 'h3'

import { match } from 'ts-pattern'

import type { Promisable } from 'type-fest'
import { _CrudGetHandler } from './crud.get'
import { _CrudPostHandler } from './crud.post'
import { _CrudPutHandler } from './crud.put'
import { _CrudPatchHandler } from './crud.patch'
import { _CrudDeleteHandler } from './crud.delete'

type TupleType<T extends string[]> = [...T]

type Params<P extends string[]> = {
  [K in TupleType<P>[number]]: string
}

export interface HandlerMethods<P extends string[]> {
  get?: (event: H3Event<EventHandlerRequest>, params: Params<P>) => Promisable<void>
  post?: (event: H3Event<EventHandlerRequest>, params: Params<P>) => Promisable<void>
  put?: (event: H3Event<EventHandlerRequest>, params: Params<P>) => Promisable<void>
  patch?: (event: H3Event<EventHandlerRequest>, params: Params<P>) => Promisable<void>
  delete?: (event: H3Event<EventHandlerRequest>, params: Params<P>) => Promisable<void>
}

export interface HandlerOptions<P extends string[] = string[]> {
  params?: P
  events?: HandlerMethods<P>
  methods?: HandlerMethods<P>
}

export function CrudHandler<T extends PgTable, P extends string[] = string[]>(schema: T, options?: HandlerOptions<TupleType<P>>) {
  return eventHandler((event) => {
    return match(event)
      .with({ method: 'GET' }, () => _CrudGetHandler(schema, event, options))
      .with({ method: 'POST' }, () => _CrudPostHandler(schema, event, options))
      .with({ method: 'PUT' }, () => _CrudPutHandler(schema, event, options))
      .with({ method: 'PATCH' }, () => _CrudPatchHandler(schema, event, options))
      .with({ method: 'DELETE' }, () => _CrudDeleteHandler(schema, event, options))
      .otherwise(() => {
        throw createError({
          statusCode: 405,
          message: 'Method Not Allowed',
        })
      })
  })
}

import { and, eq } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { EventHandlerRequest, H3Event } from 'h3'
import { camelCase, snakeCase } from 'lodash-es'
import type { HandlerOptions } from '.'

export async function _CrudGetHandler<T extends PgTable>(schema: T, event: H3Event<EventHandlerRequest>, options?: HandlerOptions) {
  const params = (options?.params || ['id'])?.map(param => ({
    key: param,
    value: getRouterParam(event, camelCase(param)) || '',
  }))

  let response: any

  if (options?.methods?.get) {
    response = await options?.methods?.get?.(event, params.map(p => p.value) as any)
  }
  else {
    response = await db.select().from(schema).where(
      and(
        ...params.map(param => eq((schema as any)[snakeCase(param.key)], param.value)),
      ),
    )
  }

  options?.events?.get?.(event, params.map(p => p.value) as any)

  return response
}

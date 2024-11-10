import { eq } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { EventHandlerRequest, H3Event } from 'h3'
import type { HandlerOptions } from '.'

export async function _CrudPutHandler<T extends PgTable>(schema: T, event: H3Event<EventHandlerRequest>, options?: HandlerOptions) {
  const id = getRouterParam(event, 'id')

  const body = await readBody(event)

  return db.update(schema).set(body).where(
    eq((schema as any).id, id),
  )
}

import { eq } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { EventHandlerRequest, H3Event } from 'h3'

export function _CrudDeleteHandler<T extends PgTable>(schema: T, event: H3Event<EventHandlerRequest>) {
  const id = getRouterParam(event, 'id')

  return db.delete(schema).where(
    eq((schema as any).id, id),
  )
}

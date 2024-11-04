import { eq } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { EventHandlerRequest, H3Event } from 'h3'

export async function _CrudPatchHandler<T extends PgTable>(schema: T, event: H3Event<EventHandlerRequest>) {
  const id = getRouterParam(event, 'id')

  const body = await readBody(event)

  return db.update(schema).set(body).where(
    eq((schema as any).id, id),
  )
}

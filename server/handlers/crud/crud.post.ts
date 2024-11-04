import type { PgTable } from 'drizzle-orm/pg-core'
import type { EventHandlerRequest, H3Event } from 'h3'

export async function _CrudPostHandler<T extends PgTable>(schema: T, event: H3Event<EventHandlerRequest>) {
  const body = await readBody(event)

  return db.insert(schema).values(body)
}

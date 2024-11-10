import type { PgTable } from 'drizzle-orm/pg-core'
import type { EventHandlerRequest, H3Event } from 'h3'
import type { HandlerOptions } from '.'

export async function _CrudPostHandler<T extends PgTable>(schema: T, event: H3Event<EventHandlerRequest>, options?: HandlerOptions) {
  const body = await readBody(event)

  return db.insert(schema).values(body)
}

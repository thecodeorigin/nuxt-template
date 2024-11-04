import type { PgTable } from 'drizzle-orm/pg-core'

import { match } from 'ts-pattern'

import { _CrudGetHandler } from './crud.get'
import { _CrudPostHandler } from './crud.post'
import { _CrudPutHandler } from './crud.put'
import { _CrudPatchHandler } from './crud.patch'
import { _CrudDeleteHandler } from './crud.delete'

export function CrudHandler<T extends PgTable>(schema: T) {
  return eventHandler((event) => {
    return match(event)
      .with({ method: 'GET' }, () => _CrudGetHandler(schema, event))
      .with({ method: 'POST' }, () => _CrudPostHandler(schema, event))
      .with({ method: 'PUT' }, () => _CrudPutHandler(schema, event))
      .with({ method: 'PATCH' }, () => _CrudPatchHandler(schema, event))
      .with({ method: 'DELETE' }, () => _CrudDeleteHandler(schema, event))
      .otherwise(() => {
        throw createError({
          statusCode: 405,
          message: 'Method Not Allowed',
        })
      })
  })
}

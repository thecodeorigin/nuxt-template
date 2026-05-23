import { db } from '@nuxthub/db'
import { permissionTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'

export default defineAuthorizedHandler(
  ['user:read'],
  async () => db.query.permissionTable.findMany({ where: eq(permissionTable.org_kind, 'tenant') }),
)

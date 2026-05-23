import { db } from '@nuxthub/db'
import { roleTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getValidatedRouterParams } from 'h3'
import { z } from 'zod'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { membersWithRole } from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'

export default defineAuthorizedHandler(['user:manage'], async (event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string() }).parse)
  const role = await db.query.roleTable.findFirst({ where: and(eq(roleTable.id, id), eq(roleTable.organization_id, orgId)) })
  if (!role)
    throw createError({ statusCode: 404, statusMessage: 'Role not found' })
  if (role.is_system)
    throw createError({ statusCode: 403, statusMessage: 'System roles cannot be deleted' })
  const affected = await membersWithRole(id)
  await db.delete(roleTable).where(eq(roleTable.id, id))
  await Promise.all(affected.map(uid => refreshUserSessions(uid)))
  return { ok: true }
})

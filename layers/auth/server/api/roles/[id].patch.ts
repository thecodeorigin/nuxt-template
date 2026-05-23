import { db } from '@nuxthub/db'
import { roleTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getValidatedRouterParams, readValidatedBody } from 'h3'
import { z } from 'zod'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { effectiveOrgGrants, membersWithRole } from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'
import { assertGrantable } from '#layers/auth/shared/permissions'
import { UpdateRoleSchema } from '#layers/auth/shared/schemas/role'

export default defineAuthorizedHandler(['user:manage'], async (event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string() }).parse)
  const role = await db.query.roleTable.findFirst({ where: and(eq(roleTable.id, id), eq(roleTable.organization_id, orgId)) })
  if (!role)
    throw createError({ statusCode: 404, statusMessage: 'Role not found' })
  const body = await readValidatedBody(event, UpdateRoleSchema.parse)
  if (body.permissions) {
    const actorGrants = await effectiveOrgGrants(session.id, orgId)
    const bad = assertGrantable(actorGrants, body.permissions)
    if (bad.length > 0)
      throw createError({ statusCode: 403, statusMessage: `Cannot grant: ${bad.join(', ')}` })
  }
  if (role.is_system && body.name !== undefined)
    throw createError({ statusCode: 403, statusMessage: 'System role name cannot be changed' })
  const [updated] = await db.update(roleTable).set({ ...body, updated_at: new Date() }).where(eq(roleTable.id, id)).returning()
  const affected = await membersWithRole(id)
  await Promise.all(affected.map(uid => refreshUserSessions(uid)))
  return updated
})

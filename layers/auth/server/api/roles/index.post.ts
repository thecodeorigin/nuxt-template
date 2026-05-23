import { db } from '@nuxthub/db'
import { roleTable } from '@nuxthub/db/schema'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { effectiveOrgGrants } from '#layers/auth/server/services/organization'
import { assertGrantable } from '#layers/auth/shared/permissions'
import { CreateRoleSchema } from '#layers/auth/shared/schemas/role'

export default defineAuthorizedHandler(['user:manage'], async (event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const body = await readValidatedBody(event, CreateRoleSchema.parse)
  const actorGrants = await effectiveOrgGrants(session.id, orgId)
  const bad = assertGrantable(actorGrants, body.permissions)
  if (bad.length > 0)
    throw createError({ statusCode: 403, statusMessage: `Cannot grant: ${bad.join(', ')}` })
  const [role] = await db.insert(roleTable).values({ organization_id: orgId, ...body }).returning()
  return role
})

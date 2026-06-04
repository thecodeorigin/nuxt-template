import { db } from '@nuxthub/db'
import { organizationMemberRoleTable, organizationMemberTable, roleTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getValidatedRouterParams, readValidatedBody } from 'h3'
import { z } from 'zod'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { countOrgManagers, effectiveOrgGrants } from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'
import { buildAbility } from '#layers/auth/shared/casl'
import { assertGrantable } from '#layers/auth/shared/permissions'
import { AssignRolesSchema } from '#layers/auth/shared/schemas/role'

export default defineAuthorizedHandler(['user:manage'], async (event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const { userId } = await getValidatedRouterParams(event, z.object({ userId: z.string() }).parse)
  const body = await readValidatedBody(event, AssignRolesSchema.parse)

  const roles = body.role_ids.length > 0
    ? await db.query.roleTable.findMany({ where: eq(roleTable.organization_id, orgId) })
    : []
  const validIds = new Set(roles.map(r => r.id))
  const invalid = body.role_ids.filter(id => !validIds.has(id))
  if (invalid.length > 0)
    throw createError({ statusCode: 400, statusMessage: 'Invalid role IDs' })

  const actorGrants = await effectiveOrgGrants(session.id, orgId)
  const actorAbility = buildAbility(actorGrants, session.id)
  for (const role of roles.filter(r => body.role_ids.includes(r.id))) {
    const bad = assertGrantable(actorAbility, role.permissions)
    if (bad.length > 0)
      throw createError({ statusCode: 403, statusMessage: `Cannot grant role "${role.name}": ${bad.join(', ')}` })
  }

  const member = await db.query.organizationMemberTable.findFirst({
    where: and(eq(organizationMemberTable.user_id, userId), eq(organizationMemberTable.organization_id, orgId)),
    columns: { id: true },
  })
  if (!member)
    throw createError({ statusCode: 404, statusMessage: 'Member not found' })

  const currentGrants = await effectiveOrgGrants(userId, orgId)
  const willLoseManage = currentGrants.includes('user:manage')
    && !body.role_ids.some(id => roles.find(r => r.id === id)?.permissions.includes('user:manage'))
  if (willLoseManage) {
    const managersCount = await countOrgManagers(orgId)
    if (managersCount <= 1)
      throw createError({ statusCode: 403, statusMessage: 'Cannot remove the last admin' })
  }

  await db.delete(organizationMemberRoleTable).where(eq(organizationMemberRoleTable.member_id, member.id))
  if (body.role_ids.length > 0) {
    await db.insert(organizationMemberRoleTable)
      .values(body.role_ids.map(roleId => ({ member_id: member.id, role_id: roleId })))
      .onConflictDoNothing()
  }
  await refreshUserSessions(userId)
  return { ok: true }
})

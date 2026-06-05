import { db } from '@nuxthub/db'
import { organizationMemberTable, organizationTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getRouterParam } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { countOrgManagers } from '#layers/auth/server/services/organization'
import { refreshUserSessions } from '#layers/auth/server/services/session'

export default defineAuthorizedHandler(['user:manage'], async (event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const userId = getRouterParam(event, 'userId')
  if (!userId)
    throw createError({ statusCode: 400, statusMessage: 'Missing userId' })
  if (userId === session.id)
    throw createError({ statusCode: 403, statusMessage: 'Use leave-organization to remove yourself' })

  const org = await db.query.organizationTable.findFirst({
    where: eq(organizationTable.id, orgId),
  })

  if (!org)
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' })

  const [targetMember] = await db
    .select()
    .from(organizationMemberTable)
    .where(and(eq(organizationMemberTable.user_id, userId), eq(organizationMemberTable.organization_id, orgId)))
    .limit(1)

  if (!targetMember)
    throw createError({ statusCode: 404, statusMessage: 'Not a member of this organization' })
  if (targetMember.abilities.includes('user:manage') && (await countOrgManagers(orgId)) <= 1)
    throw createError({ statusCode: 409, statusMessage: 'Cannot remove the last organization admin' })
  if (targetMember.user_id === org.owner_id)
    throw createError({ statusCode: 403, statusMessage: 'Cannot remove organization owner' })

  await db
    .delete(organizationMemberTable)
    .where(and(eq(organizationMemberTable.user_id, userId), eq(organizationMemberTable.organization_id, orgId)))

  await refreshUserSessions(userId)
  return { success: true }
})

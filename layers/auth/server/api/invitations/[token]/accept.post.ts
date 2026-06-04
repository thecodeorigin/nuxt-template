import { db } from '@nuxthub/db'
import { organizationMemberTable, roleTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getRouterParam } from 'h3'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import {
  assignRole,
  deleteInvitation,
  ensureMembership,
  ensureSystemRoles,
  getInvitationByToken,
  getOrganizationById,
  isMember,
} from '#layers/auth/server/services/organization'
import { getDefaultRoleAbilities } from '#layers/auth/server/services/permissions-registry'
import { refreshUserSessions } from '#layers/auth/server/services/session'
import { DefaultRole } from '#layers/auth/shared/permissions'

export default defineAuthenticatedHandler(async (event, session) => {
  const token = getRouterParam(event, 'token')
  if (!token)
    throw createError({ statusCode: 400, statusMessage: 'Missing token' })

  const inv = await getInvitationByToken(token)
  if (!inv || inv.expires_at < new Date())
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found or expired' })

  const org = await getOrganizationById(inv.organization_id)
  if (!org)
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' })

  if (inv.email !== session.primary_email)
    throw createError({ statusCode: 403, statusMessage: 'Invitation was issued to a different email address' })

  if (await isMember(session.id, inv.organization_id))
    throw createError({ statusCode: 409, statusMessage: 'You are already a member of this organization' })

  await ensureMembership(session.id, inv.organization_id, getDefaultRoleAbilities(DefaultRole.MEMBER))

  const member = await db.query.organizationMemberTable.findFirst({
    where: and(eq(organizationMemberTable.user_id, session.id), eq(organizationMemberTable.organization_id, inv.organization_id)),
    columns: { id: true },
  })

  if (member) {
    if (inv.role_id) {
      const role = await db.query.roleTable.findFirst({ where: eq(roleTable.id, inv.role_id), columns: { id: true } })
      if (role)
        await assignRole(member.id, role.id)
    }
    else {
      const roles = await ensureSystemRoles(inv.organization_id)
      const memberRole = roles.find(r => r.name === 'Member')
      if (memberRole)
        await assignRole(member.id, memberRole.id)
    }
  }

  await (useNitroApp().hooks as { callHook: (event: string, ...args: unknown[]) => Promise<void> })
    .callHook('invitation:accepted', { userId: session.id, organizationId: inv.organization_id, invitation: inv })

  await deleteInvitation(inv.id)
  await refreshUserSessions(session.id)

  return { org: { id: org.id, name: org.name } }
})

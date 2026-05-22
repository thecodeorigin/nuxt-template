import { db } from '@nuxthub/db'
import { organizationMemberTable, organizationTable, userTable } from '@nuxthub/db/schema'
import { kv } from '@nuxthub/kv'
import { and, eq, ne } from 'drizzle-orm'
import { createError, deleteCookie, getCookie, getHeader } from 'h3'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { getSystemOrganizationId } from '#layers/auth/server/services/organization'

export default defineAuthenticatedHandler(async (event, session) => {
  if (session.impersonator)
    throw createError({ statusCode: 403, statusMessage: 'Cannot delete an account while impersonating' })

  // Block if solely owning a non-empty tenant org (other members would be orphaned).
  const owned = await db
    .select()
    .from(organizationTable)
    .where(and(
      eq(organizationTable.owner_id, session.id),
      eq(organizationTable.is_personal, false),
      eq(organizationTable.is_system, false),
    ))
  for (const org of owned) {
    const [other] = await db
      .select({ id: organizationMemberTable.id })
      .from(organizationMemberTable)
      .where(and(eq(organizationMemberTable.organization_id, org.id), ne(organizationMemberTable.user_id, session.id)))
      .limit(1)
    if (other)
      throw createError({ statusCode: 409, statusMessage: `Transfer or empty "${org.name}" before deleting your account` })
  }

  // Block deleting the last platform admin.
  const systemOrgId = await getSystemOrganizationId()
  if (systemOrgId) {
    const sysMembers = await db
      .select({ user_id: organizationMemberTable.user_id, abilities: organizationMemberTable.abilities })
      .from(organizationMemberTable)
      .where(eq(organizationMemberTable.organization_id, systemOrgId))
    const impersonators = sysMembers.filter(r => r.abilities.includes('user:impersonate'))
    if (impersonators.some(r => r.user_id === session.id) && impersonators.length <= 1)
      throw createError({ statusCode: 409, statusMessage: 'You are the last platform admin; grant another before deleting your account' })
  }

  // Delete personal orgs (cascade memberships), then the user (cascade memberships/identities/activities).
  await db
    .delete(organizationTable)
    .where(and(eq(organizationTable.owner_id, session.id), eq(organizationTable.is_personal, true)))
  await db
    .delete(userTable)
    .where(eq(userTable.id, session.id))

  const sid = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')
  if (sid)
    await kv.del(`session:${sid}`)
  deleteCookie(event, 'sessionid', { path: '/' })
  return { success: true }
})

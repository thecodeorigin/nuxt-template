import { db } from '@nuxthub/db'
import { roleTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createError, getRouterParam, setCookie } from 'h3'
import { getInvitationByToken, getOrganizationById } from '#layers/auth/server/services/organization'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  if (!token)
    throw createError({ statusCode: 400, statusMessage: 'Missing token' })

  const inv = await getInvitationByToken(token)
  if (!inv || inv.expires_at < new Date())
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found or expired' })

  const org = await getOrganizationById(inv.organization_id)
  if (!org)
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' })

  let roleName: string | null = null
  if (inv.role_id) {
    const role = await db.query.roleTable.findFirst({ where: eq(roleTable.id, inv.role_id), columns: { name: true } })
    roleName = role?.name ?? null
  }

  if (inv.invited_by) {
    setCookie(event, 'ref_invite', inv.invited_by, {
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
  }

  return { id: inv.id, email: inv.email, roleName, org: { id: org.id, name: org.name } }
})

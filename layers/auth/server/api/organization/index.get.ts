import { db } from '@nuxthub/db'
import { organizationMemberTable, organizationTable } from '@nuxthub/db/schema'
import { count, eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'

export default defineAuthorizedHandler(['user:read'], async (event) => {
  const orgId = event.context.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const [org] = await db
    .select()
    .from(organizationTable)
    .where(eq(organizationTable.id, orgId))
    .limit(1)
  if (!org)
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' })
  const [c] = await db
    .select({ count: count() })
    .from(organizationMemberTable)
    .where(eq(organizationMemberTable.organization_id, orgId))
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    is_system: org.is_system,
    is_personal: org.is_personal,
    memberCount: c?.count ?? 0,
  }
})

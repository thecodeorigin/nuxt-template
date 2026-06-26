import { db } from '@nuxthub/db'
import { organizationBillingSettingsTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'

export default defineAuthorizedHandler(['billing:read', 'billing:manage'], async (_event, { session }) => {
  const orgId = session.activeOrg
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })

  const settings = await db.query.organizationBillingSettingsTable.findFirst({
    where: eq(organizationBillingSettingsTable.organization_id, orgId),
  })

  return settings ?? { organization_id: orgId, currency: 'USD' }
})

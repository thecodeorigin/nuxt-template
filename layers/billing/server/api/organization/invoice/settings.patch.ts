import { db } from '@nuxthub/db'
import { organizationBillingSettingsTable } from '@nuxthub/db/schema'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '~~/server/utils/auth'
import { UpdateBillingSettingsSchema } from '#layers/billing/shared/schemas/invoice'

export default defineAuthorizedHandler(['billing:manage'], async (event, { session }) => {
  const orgId = session.activeOrg
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })

  const body = await readValidatedBody(event, UpdateBillingSettingsSchema.parse)

  const [settings] = await db
    .insert(organizationBillingSettingsTable)
    .values({ organization_id: orgId, ...body })
    .onConflictDoUpdate({ target: organizationBillingSettingsTable.organization_id, set: body })
    .returning()

  return settings!
})

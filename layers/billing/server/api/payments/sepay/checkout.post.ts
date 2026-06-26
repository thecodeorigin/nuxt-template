import { db } from '@nuxthub/db'
import { transactionTable } from '@nuxthub/db/schema'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '~~/server/utils/auth'
import { simplifyNanoId } from '~~/shared/utils/id'
import { bankInfo, buildSepayQrUrl } from '#layers/billing/server/services/sepay'
import { CheckoutSchema } from '#layers/billing/shared/schemas/billing'

export default defineAuthorizedHandler(['billing:manage'], async (event, { session }) => {
  const orgId = session.activeOrg
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const { amount } = await readValidatedBody(event, CheckoutSchema.parse)
  const orderCode = simplifyNanoId(12)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
  const [tx] = await db.insert(transactionTable).values({
    organization_id: orgId,
    user_id: session.sub,
    type: 'top_up',
    status: 'pending',
    amount,
    gateway_ref: orderCode,
    expires_at: expiresAt,
  }).returning()
  return {
    transactionId: tx!.id,
    orderCode,
    amount,
    qrUrl: buildSepayQrUrl(amount, orderCode),
    bank: bankInfo(),
    expiresAt,
  }
})

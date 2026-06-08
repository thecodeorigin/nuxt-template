import { db } from '@nuxthub/db'
import { transactionTable } from '@nuxthub/db/schema'
import { and, eq, ne } from 'drizzle-orm'
import { createError, getHeader, readValidatedBody } from 'h3'
import { grantCredit } from '#layers/billing/server/services/credit'
import { SepayWebhookSchema } from '#layers/billing/shared/schemas/billing'
import { safeEqual } from '#layers/billing/shared/utils/crypto'

export default defineEventHandler(async (event) => {
  const c = useRuntimeConfig()
  const auth = getHeader(event, 'authorization') ?? ''
  if (!c.webhookSigningSecret || !safeEqual(auth, `Apikey ${c.webhookSigningSecret}`))
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readValidatedBody(event, SepayWebhookSchema.parse)
  if (body.transferType !== 'in')
    return { ok: true, skipped: 'not-incoming' }

  const prefix = (c.sepayTransactionPrefix as string | undefined) || 'SP'
  const memo = `${body.content} ${body.code ?? ''}`
  const m = memo.match(new RegExp(`${prefix}([A-Za-z0-9]+)`))
  const orderCode = m?.[1]
  if (!orderCode)
    return { ok: true, skipped: 'no-order-code' }

  const tx = await db.query.transactionTable.findFirst({ where: eq(transactionTable.gateway_ref, orderCode) })
  if (!tx)
    return { ok: true, skipped: 'unknown-order' }
  if (tx.status === 'success')
    return { ok: true, skipped: 'already-processed' }
  if (tx.expires_at && tx.expires_at < new Date()) {
    await db.update(transactionTable)
      .set({ status: 'expired' })
      .where(and(eq(transactionTable.id, tx.id), ne(transactionTable.status, 'success')))
    return { ok: true, skipped: 'expired' }
  }
  if (body.transferAmount < tx.amount)
    return { ok: true, skipped: 'amount-mismatch' }

  // Claim the transaction first: the status CAS (status != 'success') lets exactly
  // one delivery win, even under concurrent/duplicate SePay webhooks. Only the
  // winner credits, so the balance can never be incremented twice for one top-up.
  // (If crediting failed after the claim, status stays 'success' and SePay won't
  // retry — a rare partial state to reconcile, far cheaper than double-crediting.)
  const claimed = await db.update(transactionTable)
    .set({ status: 'success', sepay_event_id: body.id, metadata: { transferAmount: body.transferAmount } })
    .where(and(eq(transactionTable.id, tx.id), ne(transactionTable.status, 'success')))
    .returning({ id: transactionTable.id })
  if (claimed.length === 0)
    return { ok: true, skipped: 'already-processed' }

  await grantCredit(tx.organization_id, tx.amount)

  const priorSuccess = await db.query.transactionTable.findMany({
    where: and(
      eq(transactionTable.organization_id, tx.organization_id),
      eq(transactionTable.type, 'top_up'),
      eq(transactionTable.status, 'success'),
    ),
    columns: { id: true },
  })
  const isFirstTopup = priorSuccess.length <= 1

  const payload = {
    organizationId: tx.organization_id,
    userId: tx.user_id ?? null,
    transactionId: tx.id,
    amount: tx.amount,
    isFirstTopup,
  }
  await (useNitroApp().hooks as { callHook: (event: string, ...args: unknown[]) => Promise<void> }).callHook('billing:topup-succeeded', payload)

  return { ok: true }
})

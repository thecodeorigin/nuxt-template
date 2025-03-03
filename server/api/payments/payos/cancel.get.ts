import { eq } from 'drizzle-orm'
import { PaymentStatus, paymentProviderTransactionTable, userPaymentTable } from '@base/server/db/schemas'
import { joinURL, withQuery } from 'ufo'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()

  try {
    const { code, cancel, status, orderCode } = getQuery(event)

    if (code !== '00' || !orderCode)
      throw new Error('Invalid Params')

    if (cancel === 'true' && status === 'CANCELLED') {
      const { user_payments, payment_provider_transactions } = (await db.select()
        .from(paymentProviderTransactionTable)
        .where(eq(paymentProviderTransactionTable.provider_transaction_id, orderCode.toString()))
        .innerJoin(userPaymentTable, eq(userPaymentTable.id, paymentProviderTransactionTable.payment_id)))[0]

      if (!user_payments)
        throw new Error('Order Not Found')

      if (payment_provider_transactions.provider_transaction_status === PaymentStatus.CANCELLED)
        throw new Error('Order Already Cancelled')

      await db.transaction(async (db) => {
        const date = new Date()
        await db.update(paymentProviderTransactionTable).set({
          provider_transaction_status: PaymentStatus.CANCELLED,
          provider_transaction_resolved_at: date,
        }).where(eq(paymentProviderTransactionTable.id, payment_provider_transactions.id))

        await db.update(userPaymentTable).set({
          status: PaymentStatus.CANCELLED,
        }).where(eq(userPaymentTable.id, user_payments.id))
      })
    }
    const runtimeConfig = useRuntimeConfig()
    // TODO: Do something with the cancel

    return sendRedirect(
      event,
      withQuery(
        joinURL(
          runtimeConfig.public.appBaseUrl,
          runtimeConfig.public.appPaymentRedirect,
        ),
        { paymentStatus: 'cancelled' },
      ),
      200,
    )
  }
  catch {
    return sendRedirect(
      event,
      withQuery(
        joinURL(
          runtimeConfig.public.appBaseUrl,
          runtimeConfig.public.appPaymentRedirect,
        ),
        { paymentStatus: 'cancelled' },
      ),
      200,
    )
  }
})

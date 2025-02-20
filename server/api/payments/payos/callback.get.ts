import { eq } from 'drizzle-orm'
import { PaymentStatus, paymentProviderTransactionTable, userPaymentTable } from '@base/server/db/schemas'
import { withQuery, joinURL } from 'ufo'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()

  try {
    const { id } = getQuery(event)
    const { session } = await defineEventOptions(event, {
      auth: true,
    })

    if (!id)
      throw new Error('Invalid Params')

    const { status, transactions, orderCode } = await payOSAdmin.getPaymentLinkInformation(id as string)

    const { user_payments, payment_provider_transactions } = (await db.select()
      .from(paymentProviderTransactionTable)
      .where(eq(paymentProviderTransactionTable.provider_transaction_id, orderCode.toString()))
      .innerJoin(userPaymentTable, eq(userPaymentTable.id, paymentProviderTransactionTable.payment_id)))[0]

    if (!user_payments)
      throw new Error('Order Not Found')

    if (payment_provider_transactions.provider_transaction_status !== PaymentStatus.PENDING)
      throw new Error('Order Already Confirmed')

    if (status === 'PENDING')
      throw new Error('Invalid Status')

    const transactionStatus = status === 'PAID' ? PaymentStatus.RESOLVED : PaymentStatus.FAILED

    await db.transaction(async (db) => {
      const date = new Date(transactions[0].transactionDateTime)
      await db.update(paymentProviderTransactionTable).set({
        provider_transaction_status: transactionStatus,
        provider_transaction_resolved_at: date,
      }).where(eq(paymentProviderTransactionTable.id, payment_provider_transactions.id))

      await db.update(userPaymentTable).set({
        status: transactionStatus,
      }).where(eq(userPaymentTable.id, user_payments.id))
    })

    if (transactions[0].description.includes('credit') && transactionStatus === PaymentStatus.RESOLVED) {
      const [_, amount] = payment_provider_transactions.provider_transaction_info.split(':')
      await addCreditToUser(session, Number.parseInt(amount))
    }

    // TODO: Do something with the success

    return sendRedirect(
      event,
      withQuery(
        joinURL(
          runtimeConfig.public.appBaseUrl,
          runtimeConfig.public.appPaymentRedirect
        ),
        { paymentStatus: transactionStatus === PaymentStatus.RESOLVED ? 'success' : 'fail' }
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
          runtimeConfig.public.appPaymentRedirect
        ),
        { paymentStatus: 'fail' }
      ),
      200,
    )
  }
})

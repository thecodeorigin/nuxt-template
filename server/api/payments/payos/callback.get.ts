import { eq } from 'drizzle-orm'
import { PaymentStatus, paymentProviderTransactionTable, userPaymentTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { id } = getQuery(event)
    const runtimeConfig = useRuntimeConfig()

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

    // TODO: Do something with the success
    return sendRedirect(event, `${runtimeConfig.public.appBaseUrl}/settings/billing-plans`, 200)
  }
  catch {
    const runtimeConfig = useRuntimeConfig()
    return sendRedirect(event, `${runtimeConfig.public.appBaseUrl}/settings/billing-plans`, 200)
  }
})

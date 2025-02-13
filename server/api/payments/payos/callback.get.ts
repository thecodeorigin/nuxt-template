import { eq } from 'drizzle-orm'
import { PaymentStatus, paymentProviderTransactionTable, userPaymentTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { id } = getQuery(event)
    const { session } = await defineEventOptions(event, {
      auth: true,
    })
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

    if (transactions[0].description.includes('credit') && transactionStatus === PaymentStatus.RESOLVED) {
      const [_, amount] = payment_provider_transactions.provider_transaction_info.split(':')
      await addCreditToUser(session, Number.parseInt(amount))
    }

    // TODO: Do something with the success
    const queryString = transactionStatus === PaymentStatus.RESOLVED ? 'paymentStatus=success' : 'paymentStatus=fail'
    return sendRedirect(event, `${runtimeConfig.public.appBaseUrl}${runtimeConfig.public.appPaymentRedirect}?${queryString}`, 200)
  }
  catch {
    const runtimeConfig = useRuntimeConfig()
    const queryString = 'paymentStatus=fail'

    return sendRedirect(event, `${runtimeConfig.public.appBaseUrl}${runtimeConfig.public.appPaymentRedirect}?${queryString}`, 200)
  }
})

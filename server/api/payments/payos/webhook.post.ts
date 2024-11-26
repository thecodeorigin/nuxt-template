import { eq } from 'drizzle-orm'
import { PaymentStatus, paymentProviderTransactionTable, userPaymentTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const data = await readBody(event)
    const isValid = payOSAdmin.verifyPaymentWebhookData(data)

    if (!isValid) {
      throw new Error(ErrorMessage.INVALID_BODY)
    }

    const { code, orderCode, transactionDateTime } = data

    const { user_payments, payment_provider_transactions } = (await db.select()
      .from(paymentProviderTransactionTable)
      .where(eq(paymentProviderTransactionTable.provider_transaction_id, orderCode.toString()))
      .innerJoin(userPaymentTable, eq(userPaymentTable.id, paymentProviderTransactionTable.payment_id)))[0]

    if (!user_payments) {
      setResponseStatus(event, 200)
      return {
        success: true,
      }
    }

    if (payment_provider_transactions.provider_transaction_status !== PaymentStatus.PENDING) {
      setResponseStatus(event, 200)
      return {
        success: true,
      }
    }

    const transactionStatus = code === '00' ? PaymentStatus.RESOLVED : PaymentStatus.FAILED

    await db.transaction(async (db) => {
      const date = new Date(transactionDateTime)
      await db.update(paymentProviderTransactionTable).set({
        provider_transaction_status: transactionStatus,
        provider_transaction_resolved_at: date,
      }).where(eq(paymentProviderTransactionTable.id, payment_provider_transactions.id))

      await db.update(userPaymentTable).set({
        status: transactionStatus,
      }).where(eq(userPaymentTable.id, user_payments.id))
    })

    setResponseStatus(event, 200)
    return {
      success: true,
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

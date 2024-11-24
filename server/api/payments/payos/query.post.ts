import { paymentProviderTransactionTable, userPaymentTable } from '@base/server/db/schemas'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const { paymentId } = await readBody(event)

    const { user_payments, payment_provider_transactions } = (await db.select()
      .from(userPaymentTable)
      .where(eq(userPaymentTable.id, paymentId))
      .innerJoin(paymentProviderTransactionTable, eq(paymentProviderTransactionTable.payment_id, userPaymentTable.id)))[0]

    if (!user_payments || !payment_provider_transactions) {
      throw new Error('Payment not found')
    }

    const data = await payOSAdmin.getPaymentLinkInformation(payment_provider_transactions.provider_transaction_id as string)

    setResponseStatus(event, 200)
    return {
      message: 'Success',
      data,
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

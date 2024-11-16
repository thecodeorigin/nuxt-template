import type { QueryDr, QueryDrResponse } from 'vnpay'
import { generateRandomString } from 'vnpay'
import { format } from 'date-fns'
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

    const ipAddr = getRequestIP(event)
    const date = new Date().getTime().toString()
    const data: QueryDrResponse = await vnpayAdmin.queryDr({
      vnp_RequestId: generateRandomString(16),
      vnp_IpAddr: ipAddr || '127.0.0.1',
      vnp_TxnRef: paymentId,
      vnp_OrderInfo: payment_provider_transactions.provider_transaction_info,
      vnp_TransactionNo: payment_provider_transactions.provider_transaction_id,
      vnp_TransactionDate: Number(format(payment_provider_transactions.provider_transaction_resolved_at ?? new Date(), 'yyyyMMddHHmmss')),
      vnp_CreateDate: date,
    } as unknown as QueryDr)

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

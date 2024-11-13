import { eq } from 'drizzle-orm'
import type { VerifyIpnCall } from 'vnpay'
import {
  InpOrderAlreadyConfirmed,
  IpnFailChecksum,
  IpnInvalidAmount,
  IpnOrderNotFound,
  IpnSuccess,
  IpnUnknownError,
} from 'vnpay'
import { vnpayAdmin } from '~~/server/utils'
import { PaymentStatus, paymentProviderTransactionTable, userPaymentTable } from '~~/server/db/schemas'

function convertToSQLDateWithTimezone(input: string): Date {
  // Extract date and time components from the input (assuming GMT+7)
  const year = Number.parseInt(input.substring(0, 4))
  const month = Number.parseInt(input.substring(4, 6)) - 1 // JavaScript months are 0-indexed
  const day = Number.parseInt(input.substring(6, 8))
  const hours = Number.parseInt(input.substring(8, 10))
  const minutes = Number.parseInt(input.substring(10, 12))
  const seconds = Number.parseInt(input.substring(12, 14))

  // Create a Date object in UTC by adjusting for GMT+7
  const dateInGMT7 = new Date(Date.UTC(year, month, day, hours, minutes, seconds))
  const offsetInMilliseconds = -7 * 60 * 60 * 1000 // Convert from GMT+7 to UTC
  const dateInUTC = new Date(dateInGMT7.getTime() - offsetInMilliseconds)

  return dateInUTC
}

export default defineEventHandler(async (event) => {
  try {
    const { isSuccess, isVerified, vnp_TxnRef, vnp_TransactionNo, vnp_Amount, vnp_PayDate }: VerifyIpnCall = vnpayAdmin.verifyIpnCall(getQuery(event))
    setResponseStatus(event, 200)

    if (!isVerified)
      return IpnFailChecksum

    const { user_payments, payment_provider_transactions } = (await db.select()
      .from(userPaymentTable)
      .where(eq(userPaymentTable.id, vnp_TxnRef))
      .innerJoin(paymentProviderTransactionTable, eq(paymentProviderTransactionTable.payment_id, userPaymentTable.id)))[0]

    if (!user_payments)
      return IpnOrderNotFound

    if (user_payments.amount !== vnp_Amount.toString())
      return IpnInvalidAmount

    if (payment_provider_transactions.provider_transaction_status !== PaymentStatus.PENDING)
      return InpOrderAlreadyConfirmed

    const transactionStatus = isSuccess ? PaymentStatus.RESOLVED : PaymentStatus.FAILED
    const transactionDate = convertToSQLDateWithTimezone(vnp_PayDate?.toString() || '')

    await db.transaction(async (db) => {
      await db.update(paymentProviderTransactionTable).set({
        provider_transaction_id: vnp_TransactionNo?.toString(),
        provider_transaction_status: transactionStatus,
        provider_transaction_resolved_at: transactionDate,
      }).where(eq(paymentProviderTransactionTable.id, payment_provider_transactions.id))

      await db.update(userPaymentTable).set({
        status: transactionStatus,
      }).where(eq(userPaymentTable.id, user_payments.id))
    })

    return IpnSuccess
  }
  catch {
    return IpnUnknownError
  }
})

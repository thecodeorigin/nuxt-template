import { stringify } from 'node:querystring'
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
  const offsetInMilliseconds = 7 * 60 * 60 * 1000 // Convert from GMT+7 to UTC
  const dateInUTC = new Date(dateInGMT7.getTime() - offsetInMilliseconds)

  return dateInUTC
}

export default defineEventHandler(async (event) => {
  try {
    const { isSuccess, isVerified, vnp_TxnRef, vnp_TransactionNo, vnp_Amount, vnp_PayDate }: VerifyIpnCall = vnpayAdmin.verifyIpnCall(getQuery(event))

    if (!isVerified)
      throw new Error('IpnFailChecksum')

    const { user_payments, payment_provider_transactions } = (await db.select()
      .from(userPaymentTable)
      .where(eq(userPaymentTable.id, vnp_TxnRef))
      .innerJoin(paymentProviderTransactionTable, eq(paymentProviderTransactionTable.payment_id, userPaymentTable.id)))[0]

    if (!user_payments)
      throw new Error('IpnOrderNotFound')

    if (user_payments.amount !== vnp_Amount.toString())
      throw new Error('IpnInvalidAmount')

    if (payment_provider_transactions.provider_transaction_status !== PaymentStatus.PENDING)
      throw new Error('InpOrderAlreadyConfirmed')

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

    const runtimeConfig = useRuntimeConfig()
    // TODO: Do something with the success
    const queryString = stringify(IpnSuccess)
    return sendRedirect(event, `${runtimeConfig.public.appBaseUrl}/settings/billing-plans?${queryString}`, 200)
  }
  catch (error: any) {
    const runtimeConfig = useRuntimeConfig()
    let errResponse = IpnUnknownError
    switch (error.message) {
      case 'IpnFailChecksum':
        errResponse = IpnFailChecksum
        break
      case 'IpnOrderNotFound':
        errResponse = IpnOrderNotFound
        break
      case 'IpnInvalidAmount':
        errResponse = IpnInvalidAmount
        break
      case 'InpOrderAlreadyConfirmed':
        errResponse = InpOrderAlreadyConfirmed
        break
      default:
        break
    }
    const queryString = stringify(errResponse)
    // TODO: Do something with the error
    return sendRedirect(event, `${runtimeConfig.public.appBaseUrl}/settings/billing-plans?${queryString}`, 200)
  }
})

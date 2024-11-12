import { createHmac } from 'node:crypto'
import { stringify } from 'node:querystring'
import { Buffer } from 'node:buffer'
import { eq } from 'drizzle-orm'
import type { IReceive_vnp_Params } from '~/utils/types/vnpay'
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
// TODO: what if they using return URL?
export default defineEventHandler(async (event) => {
  try {
    const VNP_HASHSECRET = process.env.VNP_HASHSECRET
    const VNP_TMNCODE = process.env.VNP_TMNCODE
    if (!VNP_HASHSECRET || !VNP_TMNCODE) {
      throw createError({
        statusCode: 500,
        statusMessage: 'VNPAY CREDENTIALS NOT FOUND',
      })
    }

    const vnp_Params: IReceive_vnp_Params = getQuery(event)

    const hash = vnp_Params.vnp_SecureHash
    delete (vnp_Params as { vnp_SecureHash?: string }).vnp_SecureHash
    delete (vnp_Params as { vnp_SecureHashType?: string }).vnp_SecureHashType

    if (vnp_Params.vnp_TmnCode !== VNP_TMNCODE) {
      setResponseStatus(event, 200)
      return { RspCode: '97', Message: 'Fail checksum' }
    }

    const signData = stringify(vnp_Params as unknown as Record<string, string>)
    const buffer = new Uint8Array(Buffer.from(signData, 'utf-8'))
    const signed = createHmac('sha512', VNP_HASHSECRET).update(buffer).digest('hex')

    if (signed !== hash) {
      setResponseStatus(event, 200)
      return { RspCode: '97', Message: 'Fail checksum' }
    }

    const transactionStatus = vnp_Params.vnp_TransactionStatus === '00' ? PaymentStatus.RESOLVED : PaymentStatus.FAILED
    const transactionDate = convertToSQLDateWithTimezone(vnp_Params.vnp_PayDate)

    // TODO: What if the transaction is already resolved?
    await db.transaction(async (db) => {
      const paymentProviderTransaction = (await db.update(paymentProviderTransactionTable).set({
        provider_transaction_id: vnp_Params.vnp_TransactionNo,
        provider_transaction_status: transactionStatus,
        provider_transaction_resolved_at: transactionDate,
      }).where(eq(paymentProviderTransactionTable.id, vnp_Params.vnp_TxnRef)).returning())[0]

      await db.update(userPaymentTable).set({
        status: transactionStatus,
      }).where(eq(userPaymentTable.id, paymentProviderTransaction.payment_id))
    })

    setResponseStatus(event, 200)
    return { RspCode: '00', Message: 'Success' }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

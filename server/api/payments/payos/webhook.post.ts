import { eq } from 'drizzle-orm'
import { PaymentStatus, paymentProviderTransactionTable, userPaymentTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const webhookData = payOSAdmin.verifyPaymentWebhookData(
      await readBody(event),
    )

    if (!webhookData) {
      throw createError({
        statusCode: 400,
        message: ErrorMessage.INVALID_WEBHOOK_BODY,
      })
    }

    const transactionStatus = webhookData.code === '00' ? PaymentStatus.RESOLVED : PaymentStatus.FAILED

    const paymentTransactionOfProvider = await db.query.paymentProviderTransactionTable.findFirst({
      where: eq(paymentProviderTransactionTable.provider_transaction_id, String(webhookData.orderCode)),
      with: {
        payment: {
          with: {
            order: {
              with: {
                package: true,
              },
            },
          },
        },
      },
    })

    if (!paymentTransactionOfProvider)
      return { success: true }

    await db.transaction(async (db) => {
      await db.update(paymentProviderTransactionTable).set({
        provider_transaction_status: transactionStatus,
        provider_transaction_resolved_at: new Date(webhookData.transactionDateTime),
      }).where(
        eq(paymentProviderTransactionTable.id, paymentTransactionOfProvider.id),
      )

      await db.update(userPaymentTable).set({
        status: transactionStatus,
      }).where(
        eq(userPaymentTable.id, paymentTransactionOfProvider.payment.id),
      )

      await addCreditToUser(
        paymentTransactionOfProvider.payment.order.user_id,
        Number.parseInt(paymentTransactionOfProvider.payment.order.package.amount),
      )
    })

    return { success: true }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

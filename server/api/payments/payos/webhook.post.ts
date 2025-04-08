import { eq } from 'drizzle-orm'
import { PaymentStatus, paymentProviderTransactionTable, userPaymentTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    logger.log('[PayOS Webhook] Received webhook data:', body)

    const webhookData = getPayOSAdmin().verifyPaymentWebhookData(body)

    if (!webhookData) {
      logger.error('[PayOS Webhook] Invalid webhook data received:', body)
      throw createError({
        statusCode: 400,
        message: ErrorMessage.INVALID_WEBHOOK_BODY,
        data: body,
      })
    }

    logger.log('[PayOS Webhook] Verified webhook data:', webhookData)
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

    if (!paymentTransactionOfProvider?.payment.order.package) {
      logger.warn(`[PayOS Webhook] Transaction not found or invalid: orderCode=${webhookData.orderCode}`)
      return { success: true }
    }

    logger.log(`[PayOS Webhook] Processing transaction: orderCode=${webhookData.orderCode}, status=${transactionStatus}`)

    await db.transaction(async (db) => {
      if (!paymentTransactionOfProvider?.payment.order.package) {
        logger.error(`[PayOS Webhook] No credit package found for transaction: ${webhookData.orderCode}`)
        throw createError({
          statusCode: 400,
          message: 'No credit package found for this transaction!',
        })
      }

      logger.log(`[PayOS Webhook] Updating transaction ${paymentTransactionOfProvider.id} to status: ${transactionStatus}`)

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

      logger.log(`[PayOS Webhook] Transaction updated successfully: id=${paymentTransactionOfProvider.id}, status=${transactionStatus}`)

      const creditAmount = Number.parseInt(paymentTransactionOfProvider.payment.order.package.amount)
      const userId = paymentTransactionOfProvider.payment.order.user_id

      logger.log(`[PayOS Webhook] Adding credits: userId=${userId}, amount=${creditAmount}`)

      await addCreditToUser(userId, creditAmount)

      logger.log(`[PayOS Webhook] Credits added successfully: userId=${userId}, amount=${creditAmount}`)
    })

    logger.log('[PayOS Webhook] Webhook processing completed successfully')
    return { success: true }
  }
  catch (error: any) {
    logger.error('[PayOS Webhook] Error processing webhook:', error)
    throw parseError(error)
  }
})

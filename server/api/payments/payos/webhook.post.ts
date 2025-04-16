import { PaymentStatus } from '@base/server/db/schemas'

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

    const { updatePaymentStatus, updateProviderTransactionStatus, getProviderTransactionByOrderCode } = usePayment()

    const paymentTransactionOfProvider = await getProviderTransactionByOrderCode(String(webhookData.orderCode))

    if (!paymentTransactionOfProvider?.payment.order.package) {
      logger.warn(`[PayOS Webhook] Transaction not found or invalid: orderCode=${webhookData.orderCode}`)
      return { success: true }
    }

    logger.log(`[PayOS Webhook] Processing transaction: orderCode=${webhookData.orderCode}, status=${transactionStatus}`)

    const creditAmount = Number(paymentTransactionOfProvider.payment.order.package.amount)
    const userId = paymentTransactionOfProvider.payment.order.user_id

    // The userId is already the UUID from our database since we've updated
    // our schemas to use UUID references between tables
    logger.log(`[PayOS Webhook] Adding credits: userId=${userId}, amount=${creditAmount}`)

    await addCreditToUser(userId, creditAmount)

    logger.log(`[PayOS Webhook] Credits added successfully: userId=${userId}, amount=${creditAmount}`)

    if (!paymentTransactionOfProvider?.payment.order.package) {
      logger.error(`[PayOS Webhook] No product found for transaction: ${webhookData.orderCode}`)
      throw createError({
        statusCode: 400,
        message: 'No product found for this transaction!',
      })
    }

    logger.log(`[PayOS Webhook] Updating transaction ${paymentTransactionOfProvider.id} to status: ${transactionStatus}`)

    await updateProviderTransactionStatus(paymentTransactionOfProvider.id, transactionStatus, webhookData.transactionDateTime)

    await updatePaymentStatus(paymentTransactionOfProvider.payment.id, transactionStatus)

    logger.log(`[PayOS Webhook] Transaction updated successfully: id=${paymentTransactionOfProvider.id}, status=${transactionStatus}`)

    logger.log('[PayOS Webhook] Webhook processing completed successfully')
    return { success: true }
  }
  catch (error: any) {
    logger.error('[PayOS Webhook] Error processing webhook:', error)

    throw parseError(error)
  }
})

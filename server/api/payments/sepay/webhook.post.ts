import { PaymentStatus } from '@base/server/db/schemas'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    // {
    //   gateway: "ACB",
    //   transactionDate: "2025-05-23 23:34:40",
    //   accountNumber: "17228427",
    //   subAccount: null,
    //   code: "SPN8NHOSTING123",
    //   content: "MBVCB.9604208212.518683.SPN8NHOSTING123.CT tu 0041000331568 NGUYEN HUU NGUYEN Y toi 17228427 NGUYEN HUU NGUYEN Y tai ACB GD 518683-052325 23:34:40",
    //   transferType: "in",
    //   description: "BankAPINotify MBVCB.9604208212.518683.SPN8NHOSTING123.CT tu 0041000331568 NGUYEN HUU NGUYEN Y toi 17228427 NGUYEN HUU NGUYEN Y tai ACB GD 518683-052325 23:34:40",
    //   transferAmount: 2000,
    //   referenceCode: "3165",
    //   accumulated: 0,
    //   id: 13425123,
    // }
    const body = await readValidatedBody(
      event,
      payload => z.object({
        accountNumber: z.string(),
        accumulated: z.number(),
        code: z.string(),
        content: z.string(),
        description: z.string(),
        gateway: z.string(),
        id: z.number(),
        referenceCode: z.string(),
        subAccount: z.string().optional().nullable(),
        transactionDate: z.string(),
        transferAmount: z.number(),
        transferType: z.string(),
      }).parse(payload),
    )

    if (process.env.SEPAY_WEBHOOK_SIGNING_KEY !== getHeader(event, 'Authorization')?.match(/Apikey (.*)/)?.[1]) {
      logger.error('[SePay Webhook] Invalid webhook authentication')
      throw createError({
        statusCode: 401,
        message: 'Invalid webhook authentication',
      })
    }

    logger.log('[SePay Webhook] Verified webhook data:', body)

    // SePay Webhook always success (if not, it will not call this endpoint anyway)

    const transactionStatus = PaymentStatus.RESOLVED
    const orderCode = body.code.slice(2) || '' // Remove the first 2 characters (SP)

    const { updatePaymentStatus, updateProviderTransactionStatus, getProviderTransactionByOrderCode } = usePayment()

    const paymentTransactionOfProvider = await getProviderTransactionByOrderCode(String(orderCode))

    if (!paymentTransactionOfProvider?.payment.order.package) {
      logger.warn(`[SePay Webhook] Transaction not found or invalid: code=${orderCode}`)
      return { success: true }
    }

    logger.log(`[SePay Webhook] Processing transaction: code=${orderCode}, status=${transactionStatus}`)

    const priceDiscount = Number(paymentTransactionOfProvider.payment.order.package.price_discount)
    const price = Number(paymentTransactionOfProvider.payment.order.package.price)

    if (priceDiscount !== Number(body.transferAmount) && price !== Number(body.transferAmount)) {
      logger.error(`[SePay Webhook] Amount mismatch, transaction [${paymentTransactionOfProvider.id}]: expected=${price}, received=${body.transferAmount}`)

      throw createError({
        statusCode: 400,
        message: 'Amount mismatch!',
      })
    }

    const creditAmount = Number(paymentTransactionOfProvider.payment.order.package.amount)
    const userId = paymentTransactionOfProvider.payment.order.user_id

    // The userId is already the UUID from our database since we've updated
    // our schemas to use UUID references between tables
    logger.log(`[SePay Webhook] Adding credits: userId=${userId}, amount=${creditAmount}`)

    await addCreditToUser(userId, creditAmount)

    logger.log(`[SePay Webhook] Credits added successfully: userId=${userId}, amount=${creditAmount}`)

    if (!paymentTransactionOfProvider?.payment.order.package) {
      logger.error(`[SePay Webhook] No product found for transaction: ${orderCode}`)
      throw createError({
        statusCode: 400,
        message: 'No product found for this transaction!',
      })
    }

    logger.log(`[SePay Webhook] Updating transaction ${paymentTransactionOfProvider.id} to status: ${transactionStatus}`)

    await updateProviderTransactionStatus(paymentTransactionOfProvider.id, transactionStatus, body.transactionDate!)

    await updatePaymentStatus(paymentTransactionOfProvider.payment.id, transactionStatus)

    logger.log(`[SePay Webhook] Transaction updated successfully: id=${paymentTransactionOfProvider.id}, status=${transactionStatus}`)

    logger.log('[SePay Webhook] Webhook processing completed successfully')
    return { success: true }
  }
  catch (error: any) {
    logger.error('[SePay Webhook] Error processing webhook:', error)

    throw parseError(error)
  }
})

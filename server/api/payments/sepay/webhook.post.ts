import { PaymentStatus } from '@base/server/db/schemas'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(
      event,
      payload => z.object({
        accountNumber: z.string(), // e.g., "17228427"
        accumulated: z.number(), // e.g., 0
        code: z.string(), // e.g., "SPN8NHOSTING123"
        content: z.string(), // e.g., "MBVCB.9604208212.518683.SPN8NHOSTING123.CT tu 0041000331568 NGUYEN HUU NGUYEN Y toi 17228427 NGUYEN HUU NGUYEN Y tai ACB GD 518683-052325 23:34:40"
        description: z.string(), // e.g., "BankAPINotify MBVCB.9604208212.518683.SPN8NHOSTING123.CT tu 0041000331568 NGUYEN HUU NGUYEN Y toi 17228427 NGUYEN HUU NGUYEN Y tai ACB GD 518683-052325 23:34:40"
        gateway: z.string(), // e.g., "ACB"
        id: z.number(), // e.g., 13425123
        referenceCode: z.string(), // e.g., "3165"
        subAccount: z.string().optional().nullable(), // e.g., null
        transactionDate: z.string(), // e.g., "2025-05-23 23:34:40"
        transferAmount: z.number(), // e.g., 2000
        transferType: z.string(), // e.g., "in"
      }).parse(payload),
    )

    if (process.env.SEPAY_WEBHOOK_SIGNING_KEY !== getHeader(event, 'Authorization')?.match(/Apikey (.*)/)?.[1]) {
      console.error('[SePay Webhook] Invalid webhook authentication')
      throw createError({
        statusCode: 401,
        message: 'Invalid webhook authentication',
      })
    }

    console.log('[SePay Webhook] Verified webhook data:', body)

    // SePay Webhook always success (if not, it will not call this endpoint anyway)

    const transactionStatus = PaymentStatus.RESOLVED
    const orderCode = body.code.slice(2) || '' // Remove the first 2 characters (SP)

    const { updatePaymentStatus, updateProviderTransactionStatus, getProviderTransactionByOrderCode } = usePayment()

    const paymentTransactionOfProvider = await getProviderTransactionByOrderCode(String(orderCode))

    if (!paymentTransactionOfProvider?.payment.order.package) {
      console.warn(`[SePay Webhook] Transaction not found or invalid: code=${orderCode}`)
      return { success: true }
    }

    console.log(`[SePay Webhook] Processing transaction: code=${orderCode}, status=${transactionStatus}`)

    const userId = paymentTransactionOfProvider.payment.order.user_id

    const { getUserBestPrice, createReferenceUsage } = useReference()

    const reference = paymentTransactionOfProvider.payment.order.reference

    const price = await getUserBestPrice(
      userId,
      Number(paymentTransactionOfProvider.payment.order.package.price),
      Number(paymentTransactionOfProvider.payment.order.package.price_discount),
      reference?.code,
    )

    if (price !== Number(body.transferAmount)) {
      console.error(`[SePay Webhook] Amount mismatch, transaction [${paymentTransactionOfProvider.id}]: expected=${price}, received=${body.transferAmount}`)

      throw createError({
        statusCode: 400,
        message: 'Amount mismatch!',
      })
    }

    const creditAmount = Number(paymentTransactionOfProvider.payment.order.package.amount)

    // The userId is already the UUID from our database since we've updated
    // our schemas to use UUID references between tables
    console.log(`[SePay Webhook] Adding credits: userId=${userId}, amount=${creditAmount}`)

    await addCreditToUser(userId, creditAmount)

    console.log(`[SePay Webhook] Credits added successfully: userId=${userId}, amount=${creditAmount}`)

    if (!paymentTransactionOfProvider?.payment.order.package) {
      console.error(`[SePay Webhook] No product found for transaction: ${orderCode}`)
      throw createError({
        statusCode: 400,
        message: 'No product found for this transaction!',
      })
    }

    console.log(`[SePay Webhook] Updating transaction ${paymentTransactionOfProvider.id} to status: ${transactionStatus}`)

    await updateProviderTransactionStatus(paymentTransactionOfProvider.id, transactionStatus, body.transactionDate!)

    await updatePaymentStatus(paymentTransactionOfProvider.payment.id, transactionStatus)

    await useNitroApp().hooks.callHook('payment:success', { userId, transferAmount: body.transferAmount })

    if (reference) {
      await createReferenceUsage(
        userId,
        reference.id || '',
        paymentTransactionOfProvider.id,
      )
    }

    console.log(`[SePay Webhook] Transaction updated successfully: id=${paymentTransactionOfProvider.id}, status=${transactionStatus}`)

    console.log('[SePay Webhook] Webhook processing completed successfully')
    return { success: true }
  }
  catch (error: any) {
    console.error('[SePay Webhook] Error processing webhook:', error)

    throw parseError(error)
  }
})

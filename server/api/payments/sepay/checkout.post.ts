export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })
    const { productIdentifier } = await readBody(event)

    const paymentUrl = await createPaymentCheckout('sepay', {
      productIdentifier,
      user: session,
    })

    return {
      data: {
        paymentUrl,
      },
    }
  }
  catch (error: any) {
    logger.error('[Payment API] Error creating SePay checkout URL:', error)

    throw parseError(error)
  }
})

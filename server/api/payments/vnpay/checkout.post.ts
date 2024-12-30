export default defineEventHandler(async (event) => {
  try {
    const clientIP = getRequestIP(event)
    const { session } = await defineEventOptions(event, { auth: true })
    const { productIdentifier } = await readBody(event)

    const paymentUrl = await createPaymentCheckout('vnpay', {
      clientIP,
      productIdentifier,
      user: session,
    })

    setResponseStatus(event, 200)
    return {
      data: {
        message: 'Success',
        paymentUrl,
      },
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

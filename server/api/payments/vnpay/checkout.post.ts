export default defineEventHandler(async (event) => {
  try {
    const clientIP = getRequestIP(event)
    const { session } = await defineEventOptions(event, { auth: true })
    const { productId } = await readBody(event)

    const paymentUrl = await createPaymentCheckout('vnpay', {
      clientIP: clientIP || '',
      userEmail: session.user.email,
      productId,
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

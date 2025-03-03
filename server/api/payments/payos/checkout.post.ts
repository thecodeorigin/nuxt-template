export default defineEventHandler(async (event) => {
  try {
    const { productIdentifier } = await readBody(event)
    const { session } = await defineEventOptions(event, { auth: true })

    const paymentUrl = await createPaymentCheckout('payos', {
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

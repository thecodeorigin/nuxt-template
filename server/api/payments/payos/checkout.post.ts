export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })
    const { productIdentifier } = await readBody(event)

    const paymentUrl = await createPaymentCheckout('payos', {
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
    throw parseError(error)
  }
})

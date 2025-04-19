import type { User } from '@base/server/types/models'
import { createPayOSCheckout } from './payos'

export * from './payos'

export async function createPaymentCheckout(
  provider: 'payos' | 'vnpay',
  payload: {
    clientIP?: string
    productIdentifier: string
    user: User
  },
) {
  if (!payload.productIdentifier || !payload.user || !payload.user.id) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessage.INVALID_WEBHOOK_BODY,
    })
  }

  const [productType, productId] = payload.productIdentifier.split(':')

  let productInfo: { id: string, price: string, amount: string } | undefined

  const { createOrder, createPayment, createProviderTransaction } = usePayment()
  const { getProductByProductId } = useProduct()

  switch (productType) {
    case 'credit':
      productInfo = await getProductByProductId(productId)
      break

    default:
      throw createError({
        statusCode: 400,
        statusMessage: ErrorMessage.INVALID_WEBHOOK_BODY,
      })
  }

  if (!productInfo) {
    throw createError({
      statusCode: 404,
      statusMessage: ErrorMessage.BAD_REQUEST,
    })
  }

  const userOrder = await createOrder(productId, payload.user.id)

  const userPayment = await createPayment(
    userOrder.id,
    payload.user.id,
    Number(productInfo.price),
  )

  const orderCode = new Date().getTime()

  const paymentProviderTransaction = await createProviderTransaction(
    userPayment.id,
    payload.user.id,
    orderCode,
    provider,
    productType,
    productInfo,
  )

  switch (provider) {
    case 'payos':
      return await createPayOSCheckout({
        orderCode,
        amount: Number(userPayment.amount),
        buyerEmail: payload.user.primary_email as string,
        buyerPhone: payload.user.primary_phone as string,
        paymentProviderTransaction,
      })

    default:
      throw createError({
        statusCode: 400,
        statusMessage: ErrorMessage.INVALID_WEBHOOK_BODY,
      })
  }
}

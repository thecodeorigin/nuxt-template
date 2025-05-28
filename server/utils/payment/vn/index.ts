import type { User } from '@base/server/types/models'
import { customAlphabet } from 'nanoid'

export * from './payos'

export async function createPaymentCheckout(
  provider: 'payos' | 'vnpay' | 'sepay',
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

  let productInfo: { id: string, price: number, amount: number, price_discount: number | null } | undefined

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

  const { getUserBestPrice } = useReference()

  const referCode = getCookie(useEvent(), REFERENCE_CODE_COOKIE_NAME)

  const price = await getUserBestPrice(payload.user.id, productInfo.price, productInfo.price_discount, referCode)

  const userOrder = await createOrder(productId, payload.user.id)

  const userPayment = await createPayment(
    userOrder.id,
    payload.user.id,
    price,
  )

  // exclude underscore _
  const orderCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 16)()

  await createProviderTransaction(
    userPayment.id,
    payload.user.id,
    orderCode,
    provider,
    productType,
    productInfo,
  )

  switch (provider) {
    case 'sepay':
      return await createSePayCheckout({
        orderCode,
        amount: userPayment.amount,
      })

    default:
      throw createError({
        statusCode: 400,
        statusMessage: ErrorMessage.INVALID_WEBHOOK_BODY,
      })
  }
}

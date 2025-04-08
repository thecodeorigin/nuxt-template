import { creditPackageTable } from '@base/server/db/schemas'
import { eq } from 'drizzle-orm'
import type { LogtoUser } from '@base/server/types/logto'
import { usePayment } from '@base/server/composables/usePayment'
import { createPayOSCheckout } from './payos'

export * from './payos'

export async function createPaymentCheckout(
  provider: 'payos' | 'vnpay',
  payload: {
    clientIP?: string
    productIdentifier: string
    user: LogtoUser
  },
) {
  if (!payload.productIdentifier || !payload.user || !payload.user.sub) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessage.INVALID_WEBHOOK_BODY,
    })
  }

  const [productType, productId] = payload.productIdentifier.split(':')

  let productInfo: { id: string, price: string, amount: string } | undefined

  const { createOrder, createPayment, createProviderTransaction } = usePayment()

  switch (productType) {
    case 'credit':
      productInfo = await db.query.creditPackageTable.findFirst({
        where: eq(creditPackageTable.id, productId),
        columns: {
          id: true,
          price: true,
          amount: true,
        },
      })
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

  const createdDate = new Date()

  const userOrder = await createOrder(productId, payload.user.sub)

  const userPayment = await createPayment(
    userOrder.id,
    payload.user.sub,
    Number(productInfo.price),
  )

  const paymentProviderTransaction = await createProviderTransaction(
    userPayment.id,
    payload.user.sub,
    provider,
    productType,
    productInfo,
  )

  switch (provider) {
    case 'payos':
      return await createPayOSCheckout({
        date: createdDate,
        amount: Number.parseInt(userPayment.amount),
        buyerEmail: payload.user.email as string,
        buyerPhone: payload.user.phone_number as string,
        paymentProviderTransaction,
      })

    default:
      throw createError({
        statusCode: 400,
        statusMessage: ErrorMessage.INVALID_WEBHOOK_BODY,
      })
  }
}

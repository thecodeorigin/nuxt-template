import { PaymentStatus, creditPackageTable, paymentProviderTransactionTable, userOrderTable, userPaymentTable } from '@base/server/db/schemas'
import type { UserInfoResponse } from '@logto/nuxt'
import { eq } from 'drizzle-orm'
import { createPayOSCheckout } from './payos'
import { createVNPayCheckout } from './vnpay'

export * from './payos'

export * from './vnpay'

export async function createPaymentCheckout(
  provider: 'payos' | 'vnpay',
  payload: {
    clientIP?: string
    productIdentifier: string
    user: UserInfoResponse
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

  const { userPayment, paymentProviderTransaction } = await db.transaction(async (db) => {
    const userOrder = (
      await db.insert(userOrderTable).values({
        credit_package_id: productId,
        user_id: payload.user.sub,
      }).returning()
    )[0]

    const userPayment = (
      await db.insert(userPaymentTable).values({
        amount: productInfo.price,
        status: PaymentStatus.PENDING,
        user_id: payload.user.sub,
        order_id: userOrder.id,
        created_at: createdDate,
      }).returning()
    )[0]

    const paymentProviderTransaction = (
      await db.insert(paymentProviderTransactionTable).values({
        provider,
        provider_transaction_id: createdDate.getTime().toString(),
        provider_transaction_status: PaymentStatus.PENDING,
        provider_transaction_info: `${productType}:${productInfo.amount}`,
        payment_id: userPayment.id,
        user_id: payload.user.sub,
        created_at: createdDate,
      }).returning()
    )[0]

    return {
      userPayment,
      paymentProviderTransaction,
    }
  })

  switch (provider) {
    case 'payos':
      return await createPayOSCheckout({
        date: createdDate,
        amount: Number.parseInt(userPayment.amount),
        buyerEmail: payload.user.email as string,
        buyerPhone: payload.user.phone_number as string,
        paymentProviderTransaction,
      })
    case 'vnpay':
      return createVNPayCheckout({
        date: createdDate,
        clientIP: payload.clientIP as string,
        userPayment,
        paymentProviderTransaction,
      })

    default:
      throw createError({
        statusCode: 400,
        statusMessage: ErrorMessage.INVALID_WEBHOOK_BODY,
      })
  }
}

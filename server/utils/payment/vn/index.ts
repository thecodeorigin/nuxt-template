import { PaymentStatus, paymentProviderTransactionTable, userOrderTable, userPaymentTable } from '@base/server/db/schemas'
import type { UserInfoResponse } from '@logto/nuxt'
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
      statusMessage: ErrorMessage.INVALID_BODY,
    })
  }

  // TODO: get product info from payload.productId
  // TODO: what if the user has an existing order?
  const amount = provider === 'payos' ? 10000 : 10000 * 100 // VNPAY requires 2 extra zeros
  const date = new Date()
  const {
    userPayment,
    paymentProviderTransaction,
  } = await db.transaction(async (db) => {
    const userOrder = (await db.insert(userOrderTable).values({
      user_id: payload.user.sub,
    }).returning())[0]

    const userPayment = (await db.insert(userPaymentTable).values({
      amount: amount.toString(), // TODO: get amount from product info
      status: PaymentStatus.PENDING,
      user_id: payload.user.sub,
      order_id: userOrder.id,
      created_at: date,
    }).returning())[0]

    const paymentProviderTransaction = (await db.insert(paymentProviderTransactionTable).values({
      provider,
      provider_transaction_id: date.getTime().toString(),
      provider_transaction_status: PaymentStatus.PENDING,
      provider_transaction_info: 'no info',
      payment_id: userPayment.id,
      user_id: payload.user.sub,
      created_at: date,
    }).returning())[0]

    return {
      userPayment,
      paymentProviderTransaction,
    }
  })

  switch (provider) {
    case 'payos':
      return await createPayOSCheckout({
        date,
        buyerEmail: payload.user.email as string,
        buyerPhone: payload.user.phone_number as string,
        paymentProviderTransaction,
      })
    case 'vnpay':
      return createVNPayCheckout({
        date,
        clientIP: payload.clientIP as string,
        userPayment,
        paymentProviderTransaction,
      })

    default:
      throw createError({
        statusCode: 400,
        statusMessage: ErrorMessage.INVALID_BODY,
      })
  }
}

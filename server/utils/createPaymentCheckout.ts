import { eq } from 'drizzle-orm'
import { PaymentStatus, paymentProviderTransactionTable, sysUserTable, userOrderTable, userPaymentTable } from '@base/server/db/schemas'
import { createPayOSCheckout } from './createPayOSCheckout'
import { createVNPayCheckout } from './createVNPayCheckout'

export async function createPaymentCheckout(
  provider: 'payos' | 'vnpay',
  payload: {
    clientIP?: string
    userEmail?: string
    productId?: string
  },
) {
  try {
    // TODO: check for !payload.productId
    if (!provider || !payload.userEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: ErrorMessage.INVALID_BODY,
      })
    }

    // TODO: get product info from payload.productId

    const sysUser = await db.query.sysUserTable.findFirst({
      columns: {
        id: true,
        email: true,
        phone: true,
      },
      where: eq(sysUserTable.email, payload.userEmail as string),
    })

    if (!sysUser) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.INVALID_CREDENTIALS,
      })
    }

    // TODO: what if the user has an existing order?

    const amount = provider === 'payos' ? 10000 : 10000 * 100
    const date = new Date()
    const {
      userPayment,
      paymentProviderTransaction,
    } = await db.transaction(async (db) => {
      const userOrder = (await db.insert(userOrderTable).values({
        user_id: sysUser.id,
      }).returning())[0]

      const userPayment = (await db.insert(userPaymentTable).values({
        amount: amount.toString(), // TODO: get amount from product info
        status: PaymentStatus.PENDING,
        user_id: sysUser.id,
        order_id: userOrder.id,
        created_at: date,
      }).returning())[0]

      const paymentProviderTransaction = (await db.insert(paymentProviderTransactionTable).values({
        provider,
        provider_transaction_id: date.getTime().toString(),
        provider_transaction_status: PaymentStatus.PENDING,
        provider_transaction_info: 'no info',
        payment_id: userPayment.id,
        user_id: sysUser.id,
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
          sysUser,
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
  catch (error) {
    console.error(error)
  }
}

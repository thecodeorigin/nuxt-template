import { eq } from 'drizzle-orm'
import { PaymentStatus, paymentProviderTransactionTable, sysUserTable, userOrderTable, userPaymentTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    // const { productId } = await readBody(event)
    // TODO: get product info from productId

    const sysUser = await db.query.sysUserTable.findFirst({
      columns: {
        id: true,
        email: true,
        phone: true,
        password: true,
        email_verified: true,
      },
      where: eq(sysUserTable.email, session.user.email),
    })

    if (!sysUser) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.INVALID_CREDENTIALS,
      })
    }

    // TODO: what if the user has an existing order?
    const date = new Date()
    const {
      // userPayment,
      paymentProviderTransaction,
    } = await db.transaction(async (db) => {
      const userOrder = (await db.insert(userOrderTable).values({
        user_id: sysUser.id,
      }).returning())[0]

      const userPayment = (await db.insert(userPaymentTable).values({
        amount: '2000', // TODO: get amount from product info
        status: PaymentStatus.PENDING,
        user_id: sysUser.id,
        order_id: userOrder.id,
        created_at: date,
      }).returning())[0]

      const paymentProviderTransaction = (await db.insert(paymentProviderTransactionTable).values({
        provider: 'payos',
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

    const runtimeConfig = useRuntimeConfig()
    const { checkoutUrl } = await payOSAdmin.createPaymentLink({
      orderCode: date.getTime(),
      amount: 2000,
      description: paymentProviderTransaction.provider_transaction_info,
      cancelUrl: `${runtimeConfig.public.appBaseUrl}/api/payments/payos/cancel`,
      returnUrl: `${runtimeConfig.public.appBaseUrl}/api/payments/payos/callback`,
      buyerEmail: sysUser.email,
      buyerPhone: sysUser.phone!,
    })

    setResponseStatus(event, 200)
    return {
      data: {
        message: 'Success',
        paymentUrl: checkoutUrl,
      },
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

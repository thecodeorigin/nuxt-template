// https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
import { createHmac } from 'node:crypto'
import { stringify } from 'node:querystring'
import { Buffer } from 'node:buffer'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns'
import { PaymentStatus, paymentProviderTransactionTable, sysUserTable, userOrderTable, userPaymentTable } from '@base/server/db/schemas'
import type { ISend_vnp_Params } from '@base/utils/types/vnpay'

export default defineEventHandler(async (event) => {
  try {
    const VNP_HASHSECRET = process.env.VNP_HASHSECRET
    const VNP_TMNCODE = process.env.VNP_TMNCODE
    if (!VNP_HASHSECRET || !VNP_TMNCODE) {
      throw createError({
        statusCode: 500,
        statusMessage: 'VNPAY CREDENTIALS NOT FOUND',
      })
    }

    const ipAddr = getRequestIP(event)
    const { session } = await defineEventOptions(event, { auth: true })
    // const { productId } = await readBody(event)
    // Get product info

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
      userPayment,
      paymentProviderTransaction,
    } = await db.transaction(async (db) => {
      const userOrder = (await db.insert(userOrderTable).values({
        user_id: sysUser.id,
      }).returning())[0]

      const userPayment = (await db.insert(userPaymentTable).values({
        amount: '20000000',
        status: PaymentStatus.PENDING,
        user_id: sysUser.id,
        order_id: userOrder.id,
        created_at: date,
      }).returning())[0]

      const paymentProviderTransaction = (await db.insert(paymentProviderTransactionTable).values({
        provider: 'vnpay',
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
    const vnp_Params: ISend_vnp_Params = {
      vnp_Amount: userPayment.amount, // 200,000 VND
      vnp_Command: 'pay',
      vnp_CreateDate: format(date, 'yyyyMMddHHmmss'),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: ipAddr || '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: encodeURIComponent(paymentProviderTransaction.provider_transaction_info), // Payment info
      vnp_OrderType: 'other',
      // TODO: what if they using return URL?
      vnp_ReturnUrl: `${runtimeConfig.public.appBaseUrl}/settings/billing-plans`,
      vnp_TmnCode: VNP_TMNCODE,
      vnp_TxnRef: paymentProviderTransaction.id,
      vnp_Version: '2.1.0',
    }

    const signData = stringify(vnp_Params as unknown as Record<string, string | number>)
    const buffer = new Uint8Array(Buffer.from(signData))
    const signed = createHmac('sha512', VNP_HASHSECRET).update(buffer).digest('hex')
    vnp_Params.vnp_SecureHash = signed
    const vnpUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${stringify(vnp_Params as unknown as Record<string, string | number>)}`

    setResponseStatus(event, 200)
    return {
      data: {
        message: 'Success',
        paymentUrl: vnpUrl,
      },
    }
  }
  catch (error: any) {
    throw parseError(error)
  }
})

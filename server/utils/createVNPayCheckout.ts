import { ProductCode, VnpLocale } from 'vnpay'
import { format } from 'date-fns'
import type { paymentProviderTransactionTable, userPaymentTable } from '@base/server/db/schemas'

interface VNPayCheckoutProps {
  date: Date
  clientIP: string
  userPayment: typeof userPaymentTable.$inferSelect
  paymentProviderTransaction: typeof paymentProviderTransactionTable.$inferSelect
}

export function createVNPayCheckout({
  date,
  clientIP,
  userPayment,
  paymentProviderTransaction,
}: VNPayCheckoutProps) {
  const runtimeConfig = useRuntimeConfig()
  const paymentUrl = vnpayAdmin.buildPaymentUrl({
    vnp_Amount: Number(userPayment.amount),
    vnp_CreateDate: Number(format(date, 'yyyyMMddHHmmss')),
    vnp_IpAddr: clientIP || '127.0.0.1', // TODO: get real IP
    vnp_Locale: VnpLocale.VN,
    vnp_OrderInfo: paymentProviderTransaction.provider_transaction_info,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: `${runtimeConfig.public.appBaseUrl}/api/payments/vnpay/callback`,
    vnp_TxnRef: userPayment.id,
  })

  return paymentUrl
}

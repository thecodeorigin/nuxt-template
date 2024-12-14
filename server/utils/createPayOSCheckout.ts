import type { paymentProviderTransactionTable } from '@base/server/db/schemas'

interface payOSCheckoutProps {
  date: Date
  buyerEmail?: string
  buyerPhone?: string
  paymentProviderTransaction: typeof paymentProviderTransactionTable.$inferSelect
}

export async function createPayOSCheckout({
  date,
  buyerEmail,
  buyerPhone,
  paymentProviderTransaction,
}: payOSCheckoutProps) {
  const runtimeConfig = useRuntimeConfig()
  const { checkoutUrl } = await payOSAdmin.createPaymentLink({
    orderCode: date.getTime(),
    amount: 2000,
    description: paymentProviderTransaction.provider_transaction_info,
    cancelUrl: `${runtimeConfig.public.appBaseUrl}/api/payments/payos/cancel`,
    returnUrl: `${runtimeConfig.public.appBaseUrl}/api/payments/payos/callback`,
    buyerEmail,
    buyerPhone,
  })

  return checkoutUrl
}

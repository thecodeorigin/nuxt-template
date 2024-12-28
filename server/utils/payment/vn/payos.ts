import type { paymentProviderTransactionTable } from '@base/server/db/schemas'

import PayOS from '@payos/node'

interface payOSCheckoutProps {
  date: Date
  buyerEmail?: string
  buyerPhone?: string
  paymentProviderTransaction: typeof paymentProviderTransactionTable.$inferSelect
}

export const payOSAdmin = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!,
)

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

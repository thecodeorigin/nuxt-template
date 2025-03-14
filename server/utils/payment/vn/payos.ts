import type { paymentProviderTransactionTable } from '@base/server/db/schemas'

import PayOS from '@payos/node'

interface payOSCheckoutProps {
  date: Date
  amount: number
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
  amount,
  buyerEmail,
  buyerPhone,
  paymentProviderTransaction,
}: payOSCheckoutProps) {
  const runtimeConfig = useRuntimeConfig()
  const { checkoutUrl } = await payOSAdmin.createPaymentLink({
    orderCode: date.getTime(),
    amount,
    description: paymentProviderTransaction.provider_transaction_info,
    cancelUrl: `${runtimeConfig.public.appBaseUrl}/app/settings/credit`,
    returnUrl: `${runtimeConfig.public.appBaseUrl}/app/settings/credit`,
    buyerEmail,
    buyerPhone,
  })

  return checkoutUrl
}

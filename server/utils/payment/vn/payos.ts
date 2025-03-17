import type { paymentProviderTransactionTable } from '@base/server/db/schemas'

import PayOS from '@payos/node'

interface payOSCheckoutProps {
  date: Date
  amount: number
  buyerEmail?: string
  buyerPhone?: string
  paymentProviderTransaction: typeof paymentProviderTransactionTable.$inferSelect
}

export function getPayOSAdmin() {
  const runtimeConfig = useRuntimeConfig()

  return new PayOS(
    runtimeConfig.payos.clientId,
    runtimeConfig.payos.apiKey,
    runtimeConfig.payos.checksumKey,
  )
}

export async function createPayOSCheckout({
  date,
  amount,
  buyerEmail,
  buyerPhone,
  paymentProviderTransaction,
}: payOSCheckoutProps) {
  const runtimeConfig = useRuntimeConfig()

  const { checkoutUrl } = await getPayOSAdmin().createPaymentLink({
    orderCode: date.getTime(),
    amount,
    description: paymentProviderTransaction.provider_transaction_info,
    cancelUrl: runtimeConfig.payos.cancelUrl || `${runtimeConfig.public.appBaseUrl}/app/app/settings/credit`,
    returnUrl: runtimeConfig.payos.returnUrl || `${runtimeConfig.public.appBaseUrl}/app/app/settings/credit`,
    buyerEmail,
    buyerPhone,
  })

  return checkoutUrl
}

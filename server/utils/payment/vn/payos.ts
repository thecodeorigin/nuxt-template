import type { paymentProviderTransactionTable } from '@base/server/db/schemas'

import PayOS from '@payos/node'

interface PayOSCheckoutProps {
  orderCode: number
  amount: number
  buyerEmail?: string
  buyerPhone?: string
  paymentProviderTransaction: typeof paymentProviderTransactionTable.$inferSelect
}

export function getPayOSAdmin() {
  const config = useRuntimeConfig()

  return new PayOS(
    config.payos.clientId,
    config.payos.apiKey,
    config.payos.checksumKey,
  )
}

export async function createPayOSCheckout({
  orderCode,
  amount,
  buyerEmail,
  buyerPhone,
  paymentProviderTransaction,
}: PayOSCheckoutProps) {
  const config = useRuntimeConfig()

  const { checkoutUrl } = await getPayOSAdmin().createPaymentLink({
    orderCode,
    amount,
    description: paymentProviderTransaction.provider_transaction_info,
    cancelUrl: config.payos.cancelUrl || `${config.public.appBaseUrl}/app/settings/billing`,
    returnUrl: config.payos.returnUrl || `${config.public.appBaseUrl}/app/settings/billing`,
    buyerEmail,
    buyerPhone,
  })

  return checkoutUrl
}

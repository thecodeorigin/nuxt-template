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
  const config = useRuntimeConfig()

  return new PayOS(
    config.payos.clientId,
    config.payos.apiKey,
    config.payos.checksumKey,
  )
}

export async function createPayOSCheckout({
  date,
  amount,
  buyerEmail,
  buyerPhone,
  paymentProviderTransaction,
}: payOSCheckoutProps) {
  const config = useRuntimeConfig()

  const { checkoutUrl } = await getPayOSAdmin().createPaymentLink({
    orderCode: date.getTime(),
    amount,
    description: paymentProviderTransaction.provider_transaction_info,
    cancelUrl: config.payos.cancelUrl || `${config.public.appBaseUrl}/app/settings/credit`,
    returnUrl: config.payos.returnUrl || `${config.public.appBaseUrl}/app/settings/credit`,
    buyerEmail,
    buyerPhone,
  })

  return checkoutUrl
}

import type { paymentProviderTransactionTable, sysUserTable } from '@base/server/db/schemas'

interface payOSCheckoutProps {
  date: Date
  sysUser: Pick<typeof sysUserTable.$inferSelect, 'email' | 'phone'>
  paymentProviderTransaction: typeof paymentProviderTransactionTable.$inferSelect
}

export async function createPayOSCheckout({
  date,
  sysUser,
  paymentProviderTransaction,
}: payOSCheckoutProps) {
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

  return checkoutUrl
}

import type { paymentProviderTransactionTable } from '@base/server/db/schemas'
import { withQuery } from 'ufo'

interface SePayCheckoutProps {
  orderCode: string
  amount: number
  paymentProviderTransaction: typeof paymentProviderTransactionTable.$inferSelect
}

export async function createSePayCheckout({
  orderCode,
  amount,
  paymentProviderTransaction,
}: SePayCheckoutProps) {
  return withQuery('https://qr.sepay.vn/img', {
    acc: process.env.SEPAY_BANK_NUMBER,
    bank: process.env.SEPAY_BANK_NAME,
    amount,
    des: [orderCode, paymentProviderTransaction.provider_transaction_info].join('.'),
    template: 'compact',
    download: false,
  })
}

import { withQuery } from 'ufo'

interface SePayCheckoutProps {
  orderCode: string
  amount: number
}

export async function createSePayCheckout({
  orderCode,
  amount,
}: SePayCheckoutProps) {
  const prefix = process.env.SEPAY_TRANSACTION_PREFIX || 'SP'

  if (prefix.length !== 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Transaction prefix must be exactly 2 characters long.',
    })
  }

  return withQuery('https://qr.sepay.vn/img', {
    acc: process.env.SEPAY_BANK_NUMBER,
    bank: process.env.SEPAY_BANK_NAME,
    amount,
    des: [prefix, orderCode].join(''),
    template: 'compact',
    download: false,
  })
}

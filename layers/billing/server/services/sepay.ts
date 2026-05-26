import { withQuery } from 'ufo'
import { safeEqual } from '#layers/billing/shared/utils/crypto'

export { safeEqual }

export function buildSepayQrUrl(amount: number, orderCode: string): string {
  const c = useRuntimeConfig()
  const prefix = c.sepayTransactionPrefix || 'SP'
  return withQuery('https://qr.sepay.vn/img', {
    acc: c.sepayBankNumber,
    bank: c.sepayBankName,
    amount: String(amount),
    des: `${prefix}${orderCode}`,
    template: 'compact',
    download: 'false',
  })
}

export function bankInfo() {
  const c = useRuntimeConfig()
  return {
    bankName: c.sepayBankName,
    accountNumber: c.sepayBankNumber,
    prefix: c.sepayTransactionPrefix || 'SP',
  }
}

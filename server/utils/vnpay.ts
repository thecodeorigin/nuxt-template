import { VNPay, ignoreLogger } from 'vnpay'

export const vnpayAdmin = new VNPay({
  tmnCode: process.env.VNP_TMNCODE!,
  secureSecret: process.env.VNP_HASHSECRET!,
  testMode: process.env.NODE_ENV !== 'development',
  loggerFn: ignoreLogger,
})

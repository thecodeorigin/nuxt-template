import { VNPay, ignoreLogger } from 'vnpay'

export const vnpayAdmin = new VNPay({
  tmnCode: process.env.VNP_TMNCODE!,
  secureSecret: process.env.VNP_HASHSECRET!,
  testMode: !process.env.DISABLE_TEST_MODE,
  loggerFn: ignoreLogger,
})

import { VNPay } from 'vnpay'

export const vnpayAdmin = new VNPay({
  tmnCode: process.env.VNPAY_TMNCODE!,
  secureSecret: process.env.VNPAY_HASHSECRET!,
  testMode: !process.env.VNPAY_DISABLE_TEST_MODE,
  loggerFn: console.log,
})

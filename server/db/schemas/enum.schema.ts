import { pgEnum } from 'drizzle-orm/pg-core'

function enumToPgEnum(myEnum: any): [string, ...string[]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as [string, ...string[]]
}

export enum PaymentStatus {
  FAILED = 'failed',
  RESOLVED = 'resolved',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export enum CreditHistoryType {
  TOPUP = 'topup',
  SPEND = 'spend',
}

export enum SupportedCurrency {
  USD = 'USD',
  VND = 'VND',
}

export enum ProductType {
  CREDIT = 'credit',
  SUBSCRIPTION = 'subscription',
  OTHER = 'other',
}

export const paymentStatus = pgEnum('payment_status', enumToPgEnum(PaymentStatus))

export const creditHistoryType = pgEnum('credit_history_type', enumToPgEnum(CreditHistoryType))

export const supportedCurrency = pgEnum('supported_currency', enumToPgEnum(SupportedCurrency))

export const productType = pgEnum('product_type', enumToPgEnum(ProductType))

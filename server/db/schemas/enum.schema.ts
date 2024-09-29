import { pgEnum } from 'drizzle-orm/pg-core'

function enumToPgEnum(myEnum: any): [string, ...string[]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as [string, ...string[]]
}

export enum PricingPlanInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum PricingType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
}

export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  PAUSED = 'paused',
}

export enum ModelProject {
  TINY = 'tiny',
  MEDIUM = 'medium',
  LARGE_V3 = 'large-v3',
}

export enum StatusProject {
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
}

export const pricingPlanInterval = pgEnum('pricing_plan_interval', enumToPgEnum(PricingPlanInterval))

export const pricingType = pgEnum('pricing_type', enumToPgEnum(PricingType))

export const subscriptionStatus = pgEnum('subscription_status', enumToPgEnum(SubscriptionStatus))

export const modelProjectEnum = pgEnum('model', enumToPgEnum(ModelProject))

export const statusProjectEnum = pgEnum('status', enumToPgEnum(StatusProject))

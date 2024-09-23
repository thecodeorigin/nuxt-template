import { pgEnum } from 'drizzle-orm/pg-core'

function enumToPgEnum(myEnum: any): [string, ...string[]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as [string, ...string[]]
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum PermissionSubject {
  ALL = 'all',
  POST = 'Post',
  CATEGORY = 'Category',
  USER = 'User',
  PROJECT = 'Project',
  SETTING = 'Setting',
  LANDING = 'Landing',
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

export enum UserStatus {
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
  PENDING = 'pending',
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

export const permissionAction = pgEnum('permission_action', enumToPgEnum(PermissionAction))

export const permissionSubject = pgEnum('permission_subject', enumToPgEnum(PermissionSubject))

export const pricingPlanInterval = pgEnum('pricing_plan_interval', enumToPgEnum(PricingPlanInterval))

export const pricingType = pgEnum('pricing_type', enumToPgEnum(PricingType))

export const subscriptionStatus = pgEnum('subscription_status', enumToPgEnum(SubscriptionStatus))

export const userStatus = pgEnum('user_status', enumToPgEnum(UserStatus))

export const modelProjectEnum = pgEnum('model', enumToPgEnum(ModelProject))

export const statusProjectEnum = pgEnum('status', enumToPgEnum(StatusProject))

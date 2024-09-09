import { pgEnum } from 'drizzle-orm/pg-core'

export const permissionAction = pgEnum('permission_action', ['create', 'read', 'update', 'delete', 'manage'])

export const permissionSubject = pgEnum('permission_subject', ['all', 'Post', 'Category', 'User'])

export const pricingPlanInterval = pgEnum('pricing_plan_interval', ['day', 'week', 'month', 'year'])

export const pricingType = pgEnum('pricing_type', ['one_time', 'recurring'])

export const subscriptionStatus = pgEnum('subscription_status', ['trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused'])

export const userStatus = pgEnum('user_status', ['active', 'deactivated', 'pending'])

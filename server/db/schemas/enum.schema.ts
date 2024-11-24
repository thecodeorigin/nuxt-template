import { pgEnum } from 'drizzle-orm/pg-core'

function enumToPgEnum(myEnum: any): [string, ...string[]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as [string, ...string[]]
}

export enum PermissionScope {
  ALL = 'all',
  ORGANIZATION = 'organization',
  SELF = 'self',
  CUSTOM = 'custom',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum UserStatus {
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
  PENDING = 'pending',
}

export enum PaymentStatus {
  FAILED = 'failed',
  RESOLVED = 'resolved',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export const permissionAction = pgEnum('permission_action', enumToPgEnum(PermissionAction))

export const permissionScope = pgEnum('permission_scope', enumToPgEnum(PermissionScope))

export const userStatus = pgEnum('user_status', enumToPgEnum(UserStatus))

export const paymentStatus = pgEnum('payment_status', enumToPgEnum(PaymentStatus))

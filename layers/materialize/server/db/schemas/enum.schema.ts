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

export enum UserStatus {
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
  PENDING = 'pending',
}

export const permissionAction = pgEnum('permission_action', enumToPgEnum(PermissionAction))

export const permissionSubject = pgEnum('permission_subject', enumToPgEnum(PermissionSubject))

export const userStatus = pgEnum('user_status', enumToPgEnum(UserStatus))

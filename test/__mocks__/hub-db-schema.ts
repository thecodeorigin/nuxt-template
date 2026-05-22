export const userTable = {} as any
export const identityTable = {} as any
export const activityTable = {} as any
export const organizationTable = {} as any
export const organizationMemberTable = {} as any
export const permissionTable = {} as any
export const todoTable = {} as any
export enum ActivityAction {
  SIGN_IN = 'auth:sign_in',
  SIGN_UP = 'auth:sign_up',
  IMPERSONATE_START = 'auth:impersonate_start',
  IMPERSONATE_STOP = 'auth:impersonate_stop',
}

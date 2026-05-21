export const userTable = {} as any
export const identityTable = {} as any
export const activityTable = {} as any
export enum ActivityAction {
  SIGN_IN = 'auth:sign_in',
  SIGN_UP = 'auth:sign_up',
  IMPERSONATE_START = 'auth:impersonate_start',
  IMPERSONATE_STOP = 'auth:impersonate_stop',
}

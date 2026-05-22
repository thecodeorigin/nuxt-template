import type { AuthUser, ImpersonatorInfo } from '#layers/auth/server/services/auth'
import { pick } from 'es-toolkit'

export const IMPERSONATE_ABILITY = 'user:impersonate'

export function impersonatorInfoFromSession(session: AuthUser): ImpersonatorInfo {
  return pick(session, ['id', 'username', 'name', 'primary_email', 'abilities'])
}

export function backupKey(sessionId: string): string {
  return `impersonator:session:${sessionId}`
}

export function sessionKey(sessionId: string): string {
  return `session:${sessionId}`
}

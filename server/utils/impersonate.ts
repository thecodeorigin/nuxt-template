import type { AuthUser, ImpersonatorInfo } from '~~/server/utils/auth'

export const IMPERSONATE_ABILITY = 'user:impersonate'

export function impersonatorInfoFromSession(session: AuthUser): ImpersonatorInfo {
  return {
    id: session.id,
    username: session.username,
    name: session.name,
    primary_email: session.primary_email,
    abilities: session.abilities,
  }
}

export interface TargetUserRecord {
  id: string
  primary_email: string
  primary_phone: string | null
  username: string | null
  name: string | null
  avatar: string | null
  verified: boolean | null
  abilities: string[] | null
}

export function buildImpersonatedSession(
  target: TargetUserRecord,
  impersonator: ImpersonatorInfo,
): AuthUser {
  return {
    id: target.id,
    primary_email: target.primary_email,
    primary_phone: target.primary_phone,
    username: target.username ?? '',
    name: target.name ?? '',
    avatar: target.avatar,
    verified: target.verified ?? false,
    provider: 'impersonation',
    abilities: target.abilities ?? [],
    impersonator,
  }
}

export function backupKey(sessionId: string): string {
  return `impersonator:session:${sessionId}`
}

export function sessionKey(sessionId: string): string {
  return `session:${sessionId}`
}

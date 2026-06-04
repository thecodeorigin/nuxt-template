export const SYSTEM_ABILITY_KEYS = new Set<string>([
  'user:impersonate',
  'system:manage',
  'support:manage',
  'product:write',
  'product:delete',
  'product:manage',
])

export enum DefaultRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

export const DEFAULT_ROLE_NAME: Record<DefaultRole, string> = {
  [DefaultRole.ADMIN]: 'Admin',
  [DefaultRole.MEMBER]: 'Member',
  [DefaultRole.GUEST]: 'Guest',
}

export interface PermissionDef {
  key: string
  subject: string
  action: string
  scope: string | null
  org_kind: 'system' | 'tenant'
  description: string
}

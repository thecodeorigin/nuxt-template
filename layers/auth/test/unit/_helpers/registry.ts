import { _resetPermissionDomains, definePermissionDomain } from '#layers/auth/server/services/permissions-registry'
import { DefaultRole } from '#layers/auth/shared/permissions'

export function registerCoreDomainsForTest() {
  _resetPermissionDomains()
  definePermissionDomain({
    subject: 'user',
    orgKind: 'tenant',
    self: true,
    defaultRoleAbilities: {
      [DefaultRole.ADMIN]: ['user:manage'],
      [DefaultRole.MEMBER]: ['user:read', 'user:read:self', 'user:write:self', 'user:delete:self', 'user:manage:self'],
      [DefaultRole.GUEST]: ['user:read:self'],
    },
  })
  definePermissionDomain({
    subject: 'project',
    orgKind: 'tenant',
    self: true,
    defaultRoleAbilities: {
      [DefaultRole.ADMIN]: ['project:manage'],
      [DefaultRole.MEMBER]: ['project:read', 'project:write', 'project:read:self', 'project:write:self', 'project:delete:self', 'project:manage:self'],
      [DefaultRole.GUEST]: ['project:read', 'project:read:self'],
    },
  })
  definePermissionDomain({
    subject: 'billing',
    orgKind: 'tenant',
    self: true,
    defaultRoleAbilities: {
      [DefaultRole.ADMIN]: ['billing:manage'],
      [DefaultRole.MEMBER]: ['billing:read', 'billing:read:self'],
    },
  })
  definePermissionDomain({
    subject: 'selfhost',
    orgKind: 'tenant',
    self: true,
    defaultRoleAbilities: {
      [DefaultRole.ADMIN]: ['selfhost:manage'],
      [DefaultRole.MEMBER]: ['selfhost:read', 'selfhost:write'],
    },
  })
}

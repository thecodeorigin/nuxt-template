import { definePermissionDomain } from '#layers/auth/server/services/permissions-registry'
import { DefaultRole } from '#layers/auth/shared/permissions'

export default defineNitroPlugin(() => {
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
})

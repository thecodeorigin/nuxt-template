import { definePermissionDomain } from '#layers/auth/server/services/permissions-registry'
import { DefaultRole } from '#layers/auth/shared/permissions'

export default defineNitroPlugin(() => {
  definePermissionDomain({
    subject: 'billing',
    orgKind: 'tenant',
    self: true,
    defaultRoleAbilities: {
      [DefaultRole.ADMIN]: ['billing:manage'],
      [DefaultRole.MEMBER]: ['billing:read', 'billing:read:self'],
    },
  })
})

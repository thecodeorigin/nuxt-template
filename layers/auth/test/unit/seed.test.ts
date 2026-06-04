import { beforeEach, describe, expect, it } from 'vitest'
import { SEED_USERS, SYSTEM_GRANTS } from '#layers/auth/server/constants/defaults'
import { getDefaultRoleAbilities } from '#layers/auth/server/services/permissions-registry'
import seedAllTask from '#layers/auth/server/tasks/seed/all'
import seedUsersTask from '#layers/auth/server/tasks/seed/users'
import { DefaultRole, SYSTEM_ABILITY_KEYS } from '#layers/auth/shared/permissions'
import { registerCoreDomainsForTest } from '#layers/auth/test/unit/_helpers/registry'

beforeEach(() => registerCoreDomainsForTest())

describe('org grant sets', () => {
  it('grants user:impersonate only via the system org (admin)', () => {
    expect(SYSTEM_GRANTS.admin).toContain('user:impersonate')
  })

  it('default admin role gets full tenant control, others are scoped down', () => {
    expect(getDefaultRoleAbilities(DefaultRole.ADMIN)).toEqual(expect.arrayContaining(['user:manage', 'project:manage']))
    expect(getDefaultRoleAbilities(DefaultRole.MEMBER)).not.toContain('user:manage')
    expect(getDefaultRoleAbilities(DefaultRole.GUEST)).not.toContain('user:manage')
  })

  it('drops the legacy blog subject everywhere', () => {
    const all = [
      ...SYSTEM_GRANTS.admin,
      ...getDefaultRoleAbilities(DefaultRole.ADMIN),
      ...getDefaultRoleAbilities(DefaultRole.MEMBER),
      ...getDefaultRoleAbilities(DefaultRole.GUEST),
    ]
    for (const a of all)
      expect(a.startsWith('blog:')).toBe(false)
  })

  it('uses the canonical "subject:action" or "subject:action:scope" format', () => {
    const all = [
      ...SYSTEM_GRANTS.admin,
      ...getDefaultRoleAbilities(DefaultRole.ADMIN),
      ...getDefaultRoleAbilities(DefaultRole.MEMBER),
      ...getDefaultRoleAbilities(DefaultRole.GUEST),
    ]
    for (const a of all)
      expect(a).toMatch(/^[a-z]+:[a-z]+(:self)?$/)
  })
})

describe('system grant keys', () => {
  it('every system grant key is a system key', () => {
    for (const a of SYSTEM_GRANTS.admin)
      expect(SYSTEM_ABILITY_KEYS.has(a)).toBe(true)
  })
})

describe('seed users', () => {
  it('uses the @seed.local email suffix so cleanup is unambiguous', () => {
    for (const u of SEED_USERS)
      expect(u.primary_email).toMatch(/@seed\.local$/)
  })

  it('every seed user has a unique email', () => {
    const emails = SEED_USERS.map(u => u.primary_email)
    expect(new Set(emails).size).toBe(emails.length)
  })
})

describe('seed tasks', () => {
  it('expose the expected task names + run handlers', () => {
    expect(seedUsersTask.meta?.name).toBe('seed:users')
    expect(seedAllTask.meta?.name).toBe('seed:all')
    for (const t of [seedUsersTask, seedAllTask])
      expect(typeof t.run).toBe('function')
  })
})

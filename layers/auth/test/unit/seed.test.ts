import { describe, expect, it } from 'vitest'
import { DEMO_ORG_GRANTS, SEED_USERS, SYSTEM_GRANTS } from '#layers/auth/server/constants/defaults'

describe('org grant sets', () => {
  it('grants user:impersonate only via the system org (admin)', () => {
    expect(SYSTEM_GRANTS.admin).toContain('user:impersonate')
  })

  it('demo-org admin gets full tenant control, others are scoped down', () => {
    expect(DEMO_ORG_GRANTS.admin).toEqual(expect.arrayContaining(['user:manage', 'project:manage']))
    expect(DEMO_ORG_GRANTS.member).not.toContain('user:manage')
    expect(DEMO_ORG_GRANTS.guest).not.toContain('user:manage')
  })

  it('no tenant grant smuggles a system (impersonate) key', () => {
    const tenant = [...DEMO_ORG_GRANTS.admin, ...DEMO_ORG_GRANTS.member, ...DEMO_ORG_GRANTS.guest]
    expect(tenant).not.toContain('user:impersonate')
  })

  it('drops the legacy blog subject everywhere', () => {
    const all = [...SYSTEM_GRANTS.admin, ...DEMO_ORG_GRANTS.admin, ...DEMO_ORG_GRANTS.member, ...DEMO_ORG_GRANTS.guest]
    for (const a of all)
      expect(a.startsWith('blog:')).toBe(false)
  })

  it('uses the canonical "subject:action" or "subject:action:scope" format', () => {
    const all = [...SYSTEM_GRANTS.admin, ...DEMO_ORG_GRANTS.admin, ...DEMO_ORG_GRANTS.member, ...DEMO_ORG_GRANTS.guest]
    for (const a of all)
      expect(a).toMatch(/^[a-z]+:[a-z]+(:self)?$/)
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

import { describe, expect, it } from 'vitest'
import { ABILITY_PRESETS, SEED_USERS } from '~~/shared/seed/users'

describe('ability presets', () => {
  it('grants user:impersonate to the admin preset', () => {
    expect(ABILITY_PRESETS.admin).toContain('user:impersonate')
  })

  it('does NOT grant user:impersonate to non-admin presets', () => {
    expect(ABILITY_PRESETS.member).not.toContain('user:impersonate')
    expect(ABILITY_PRESETS.guest).not.toContain('user:impersonate')
  })

  it('uses the canonical "subject:action" or "subject:action:scope" format for every ability', () => {
    const all = [...ABILITY_PRESETS.admin, ...ABILITY_PRESETS.member, ...ABILITY_PRESETS.guest]
    for (const a of all) {
      expect(a).toMatch(/^[a-z]+:[a-z]+(:self)?$/)
    }
  })
})

describe('seed users', () => {
  it('seeds exactly one admin user with the impersonate ability', () => {
    const admins = SEED_USERS.filter(u => u.abilities.includes('user:impersonate'))
    expect(admins).toHaveLength(1)
    expect(admins[0]!.primary_email).toBe('admin@seed.local')
  })

  it('uses the @seed.local email suffix so cleanup is unambiguous', () => {
    for (const u of SEED_USERS) {
      expect(u.primary_email).toMatch(/@seed\.local$/)
    }
  })

  it('every seed user has a unique email', () => {
    const emails = SEED_USERS.map(u => u.primary_email)
    expect(new Set(emails).size).toBe(emails.length)
  })
})

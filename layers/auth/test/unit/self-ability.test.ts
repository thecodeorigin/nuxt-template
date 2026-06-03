import { describe, expect, it, vi } from 'vitest'
import { _resetSubjects, getSubjectRegistration } from '#layers/auth/server/services/casl'

vi.stubGlobal('defineNitroPlugin', (fn: any) => fn)

describe('auth subject registration (self.ability.ts)', () => {
  it('registers the user subject with id-based ownership', async () => {
    _resetSubjects()
    const plugin = (await import('#layers/auth/server/plugins/self.ability')).default
    plugin({} as any)

    const reg = getSubjectRegistration('user')
    expect(reg).toBeDefined()
    expect(reg!.paramName).toBe('userId')
    expect(reg!.ownerKey).toBe('id')
  })

  it('does not register the project subject (owned by the project layer)', async () => {
    _resetSubjects()
    const plugin = (await import('#layers/auth/server/plugins/self.ability')).default
    plugin({} as any)

    expect(getSubjectRegistration('project')).toBeUndefined()
  })
})

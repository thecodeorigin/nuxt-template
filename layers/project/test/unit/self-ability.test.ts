import { describe, expect, it, vi } from 'vitest'
import { _resetSubjects, getSubjectRegistration } from '#layers/auth/server/services/casl'

vi.stubGlobal('defineNitroPlugin', (fn: any) => fn)

describe('project subject registration (self.ability.ts)', () => {
  it('registers project with paramName "id" and ownerKey "owner_id"', async () => {
    _resetSubjects()
    const plugin = (await import('#layers/project/server/plugins/self.ability')).default
    plugin({} as any)

    const reg = getSubjectRegistration('project')
    expect(reg).toBeDefined()
    expect(reg!.paramName).toBe('id')
    expect(reg!.ownerKey).toBe('owner_id')
  })

  it('fetch returns null when no owner member row exists', async () => {
    _resetSubjects()
    const plugin = (await import('#layers/project/server/plugins/self.ability')).default
    plugin({} as any)

    const reg = getSubjectRegistration('project')
    const result = await reg!.fetch('some-project-id', {} as any)
    expect(result).toBeNull()
  })
})

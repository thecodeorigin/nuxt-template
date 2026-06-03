import { describe, expect, it, vi } from 'vitest'
import { getSubjectRegistration } from '#layers/auth/server/services/casl'

vi.stubGlobal('defineNitroPlugin', (fn: any) => fn)

describe('subject registration', () => {
  it('registers the user subject with id-based ownership', async () => {
    // Run the plugin setup
    const registerSubjects = (await import('#layers/auth/server/plugins/register-subjects')).default
    registerSubjects({} as any)

    const reg = getSubjectRegistration('user')
    expect(reg).toBeDefined()
    expect(reg!.paramName).toBe('userId')
    expect(reg!.ownerKey).toBe('id')
  })
})

import { describe, expect, it } from 'vitest'
import { UpdateOrganizationSchema } from '#layers/auth/shared/schemas/organization'

describe('updateOrganizationSchema', () => {
  it('accepts a valid name', () => {
    expect(UpdateOrganizationSchema.parse({ name: 'Acme' })).toEqual({ name: 'Acme' })
  })
  it('rejects empty / overlong', () => {
    expect(() => UpdateOrganizationSchema.parse({ name: '' })).toThrow()
    expect(() => UpdateOrganizationSchema.parse({ name: 'a'.repeat(101) })).toThrow()
  })
})

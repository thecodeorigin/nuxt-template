import { describe, expect, it } from 'vitest'
import { AddProjectMemberSchema, AddProjectProductSchema, CreateProjectSchema, UpdateProjectSchema } from '#layers/project/shared/schemas/project'

describe('createProjectSchema', () => {
  it('accepts a valid project', () => {
    const result = CreateProjectSchema.safeParse({ name: 'My Project' })
    expect(result.success).toBe(true)
  })

  it('defaults status to active', () => {
    const result = CreateProjectSchema.safeParse({ name: 'Test' })
    expect(result.success).toBe(true)
    if (result.success)
      expect(result.data.status).toBe('active')
  })

  it('rejects empty name', () => {
    const result = CreateProjectSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects description over 2000 chars', () => {
    const result = CreateProjectSchema.safeParse({ name: 'Test', description: 'x'.repeat(2001) })
    expect(result.success).toBe(false)
  })
})

describe('updateProjectSchema', () => {
  it('accepts partial update', () => {
    expect(UpdateProjectSchema.safeParse({ name: 'New Name' }).success).toBe(true)
  })

  it('accepts empty object', () => {
    expect(UpdateProjectSchema.safeParse({}).success).toBe(true)
  })
})

describe('addProjectProductSchema', () => {
  it('accepts valid product id', () => {
    const result = AddProjectProductSchema.safeParse({ product_id: crypto.randomUUID() })
    expect(result.success).toBe(true)
  })

  it('defaults quantity to 1', () => {
    const result = AddProjectProductSchema.safeParse({ product_id: crypto.randomUUID() })
    if (result.success)
      expect(result.data.quantity).toBe(1)
  })

  it('rejects non-uuid product_id', () => {
    const result = AddProjectProductSchema.safeParse({ product_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

describe('addProjectMemberSchema', () => {
  it('accepts valid user id', () => {
    const result = AddProjectMemberSchema.safeParse({ user_id: crypto.randomUUID() })
    expect(result.success).toBe(true)
  })

  it('defaults role to member', () => {
    const result = AddProjectMemberSchema.safeParse({ user_id: crypto.randomUUID() })
    if (result.success)
      expect(result.data.role).toBe('member')
  })
})

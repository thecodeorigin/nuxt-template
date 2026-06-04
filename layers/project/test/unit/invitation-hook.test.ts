import { beforeEach, describe, expect, it, vi } from 'vitest'

// Track insert calls
const insertedRows: { project_id: string, user_id: string, role: string }[] = []
const mockOnConflictDoNothing = vi.fn(async () => {})

vi.mock('@nuxthub/db', () => ({
  db: {
    insert: (_table: unknown) => ({
      values: (row: { project_id: string, user_id: string, role: string }) => {
        insertedRows.push(row)
        return { onConflictDoNothing: mockOnConflictDoNothing }
      },
    }),
  },
}))

// Capture the hook registered by the plugin
type HookCallback = (p: { userId: string, organizationId: string, invitation: Record<string, unknown> }) => Promise<void>
let hookCallback: HookCallback | null = null

const g = globalThis as Record<string, unknown>
g.defineNitroPlugin = (fn: (nitro: { hooks: { hook: (event: string, cb: HookCallback) => void } }) => void) => {
  fn({
    hooks: {
      hook: (event: string, cb: HookCallback) => {
        if (event === 'invitation:accepted')
          hookCallback = cb
      },
    },
  })
}

// Import plugin after globals are set up
await import('#layers/project/server/plugins/invitation')

function makeInvitation(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'inv-1',
    organization_id: 'org-1',
    email: 'user@example.com',
    token: 'tok',
    invited_by: null,
    role_id: null,
    project_ids: [],
    metadata: {},
    created_at: new Date(),
    expires_at: new Date(),
    ...over,
  }
}

beforeEach(() => {
  insertedRows.length = 0
  mockOnConflictDoNothing.mockClear()
})

describe('invitation:accepted hook — project membership write', () => {
  it('inserts project members from metadata.project_ids', async () => {
    await hookCallback!({
      userId: 'u-1',
      organizationId: 'org-1',
      invitation: makeInvitation({ metadata: { project_ids: ['p-1', 'p-2'] } }),
    })
    expect(insertedRows).toEqual([
      { project_id: 'p-1', user_id: 'u-1', role: 'member' },
      { project_id: 'p-2', user_id: 'u-1', role: 'member' },
    ])
    expect(mockOnConflictDoNothing).toHaveBeenCalledTimes(2)
  })

  it('falls back to legacy project_ids column when metadata has none', async () => {
    await hookCallback!({
      userId: 'u-2',
      organizationId: 'org-1',
      invitation: makeInvitation({ project_ids: ['p-3'], metadata: {} }),
    })
    expect(insertedRows).toEqual([{ project_id: 'p-3', user_id: 'u-2', role: 'member' }])
  })

  it('prefers metadata.project_ids over legacy when both present', async () => {
    await hookCallback!({
      userId: 'u-3',
      organizationId: 'org-1',
      invitation: makeInvitation({ project_ids: ['legacy-p'], metadata: { project_ids: ['meta-p'] } }),
    })
    expect(insertedRows).toEqual([{ project_id: 'meta-p', user_id: 'u-3', role: 'member' }])
  })

  it('is a no-op when both metadata.project_ids and legacy project_ids are empty', async () => {
    await hookCallback!({
      userId: 'u-4',
      organizationId: 'org-1',
      invitation: makeInvitation(),
    })
    expect(insertedRows).toHaveLength(0)
    expect(mockOnConflictDoNothing).not.toHaveBeenCalled()
  })

  it('is a no-op when metadata.project_ids is a non-array value', async () => {
    await hookCallback!({
      userId: 'u-5',
      organizationId: 'org-1',
      invitation: makeInvitation({ metadata: { project_ids: 'not-an-array' } }),
    })
    expect(insertedRows).toHaveLength(0)
  })
})

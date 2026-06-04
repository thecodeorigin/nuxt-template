import type { H3Event } from 'h3'
import type { AuthUser } from '#layers/auth/server/services/auth'
import { beforeEach, describe, expect, it } from 'vitest'
import { _resetSubjects, defineSubject, evaluateChecks } from '#layers/auth/server/services/casl'
import {
  PROJECT_CREATE_GATE,
  PROJECT_DELETE_GATE,
  PROJECT_READ_DETAIL_GATE,
  PROJECT_READ_LIST_GATE,
  PROJECT_WRITE_SELF_GATE,
} from '#layers/project/server/constants/gates'

function makeEvent(params: Record<string, string> = {}): H3Event {
  return { context: { params } } as unknown as H3Event
}

function makeSession(over: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    primary_email: 'a@b.com',
    primary_phone: null,
    username: 'u',
    name: 'U',
    avatar: null,
    bio: null,
    verified: true,
    provider: 'agent',
    abilities: [],
    activeOrganizationId: 'org-1',
    ...over,
  }
}

// Mirror DEFAULT_ROLE_ABILITIES project slices (permissions.ts).
const ADMIN = ['project:manage']
const MEMBER = [
  'project:read',
  'project:write',
  'project:read:self',
  'project:write:self',
  'project:delete:self',
  'project:manage:self',
]
const GUEST = ['project:read', 'project:read:self']

function registerOwner(ownerId: string) {
  defineSubject('project', {
    paramName: 'id',
    ownerKey: 'owner_id',
    fetch: async (id: string) => ({ id, owner_id: ownerId }),
  })
}

beforeEach(() => _resetSubjects())

describe('gate constants invariant', () => {
  it('write-targeting gates never admit the unscoped create key (project:write)', () => {
    expect(PROJECT_WRITE_SELF_GATE).not.toContain('project:write')
    expect(PROJECT_DELETE_GATE).not.toContain('project:write')
  })

  it('only the create gate lists unscoped project:write', () => {
    expect(PROJECT_CREATE_GATE).toContain('project:write')
  })
})

describe('delete gate — owner vs non-owner vs admin', () => {
  it('admin (manage) deletes any project', async () => {
    registerOwner('owner-2')
    const r = await evaluateChecks(PROJECT_DELETE_GATE, makeSession({ id: 'admin-1', abilities: ADMIN }), makeEvent({ id: 'p-1' }))
    expect(r.allowed).toBe(true)
  })

  it('member deletes a project they own', async () => {
    registerOwner('user-1')
    const r = await evaluateChecks(PROJECT_DELETE_GATE, makeSession({ id: 'user-1', abilities: MEMBER }), makeEvent({ id: 'p-1' }))
    expect(r.allowed).toBe(true)
  })

  it('member CANNOT delete a project owned by someone else', async () => {
    registerOwner('owner-2')
    const r = await evaluateChecks(PROJECT_DELETE_GATE, makeSession({ id: 'user-1', abilities: MEMBER }), makeEvent({ id: 'p-1' }))
    expect(r.allowed).toBe(false)
  })

  it('guest cannot delete', async () => {
    registerOwner('user-1')
    const r = await evaluateChecks(PROJECT_DELETE_GATE, makeSession({ id: 'user-1', abilities: GUEST }), makeEvent({ id: 'p-1' }))
    expect(r.allowed).toBe(false)
  })
})

describe('write-self gate (patch / members / products)', () => {
  it('owner passes', async () => {
    registerOwner('user-1')
    const r = await evaluateChecks(PROJECT_WRITE_SELF_GATE, makeSession({ id: 'user-1', abilities: MEMBER }), makeEvent({ id: 'p-1' }))
    expect(r.allowed).toBe(true)
  })

  it('non-owner member denied', async () => {
    registerOwner('owner-2')
    const r = await evaluateChecks(PROJECT_WRITE_SELF_GATE, makeSession({ id: 'user-1', abilities: MEMBER }), makeEvent({ id: 'p-1' }))
    expect(r.allowed).toBe(false)
  })

  it('admin passes without ownership', async () => {
    registerOwner('owner-2')
    const r = await evaluateChecks(PROJECT_WRITE_SELF_GATE, makeSession({ id: 'admin-1', abilities: ADMIN }), makeEvent({ id: 'p-1' }))
    expect(r.allowed).toBe(true)
  })
})

describe('create gate', () => {
  it('member creates (unscoped write, no resource id)', async () => {
    const r = await evaluateChecks(PROJECT_CREATE_GATE, makeSession({ abilities: MEMBER }), makeEvent())
    expect(r.allowed).toBe(true)
  })

  it('guest cannot create', async () => {
    const r = await evaluateChecks(PROJECT_CREATE_GATE, makeSession({ abilities: GUEST }), makeEvent())
    expect(r.allowed).toBe(false)
  })
})

describe('read gates (org-wide read kept)', () => {
  it('member reads list and detail via unscoped read', async () => {
    registerOwner('owner-2')
    expect((await evaluateChecks(PROJECT_READ_LIST_GATE, makeSession({ abilities: MEMBER }), makeEvent())).allowed).toBe(true)
    expect((await evaluateChecks(PROJECT_READ_DETAIL_GATE, makeSession({ abilities: MEMBER }), makeEvent({ id: 'p-1' }))).allowed).toBe(true)
  })
})

import type { H3Event } from 'h3'
import type { AuthUser } from '#layers/auth/server/services/auth'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  _resetSubjects,
  defineSubject,
  evaluateChecks,
  runAuthorizedHandler,
} from '#layers/auth/server/services/casl'

function makeEvent(params: Record<string, string> = {}): H3Event {
  return { context: { params } } as unknown as H3Event
}

function makeSession(over: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    primary_email: 'a@b.com',
    primary_phone: null,
    username: 'user1',
    name: 'User One',
    avatar: null,
    bio: null,
    verified: true,
    provider: 'agent',
    abilities: [],
    activeOrganizationId: null,
    ...over,
  }
}

beforeEach(() => _resetSubjects())

describe('evaluateChecks — ability string checks', () => {
  it('grants when the user has the exact "subject:action"', async () => {
    const result = await evaluateChecks(['blog:read'], makeSession({ abilities: ['blog:read'] }), makeEvent())
    expect(result).toEqual({ allowed: true })
  })

  it('grants via the "manage" wildcard for read/write/delete on the same subject', async () => {
    for (const required of ['todo:read', 'todo:write', 'todo:delete']) {
      const result = await evaluateChecks([required], makeSession({ abilities: ['todo:manage'] }), makeEvent())
      expect(result).toEqual({ allowed: true })
    }
  })

  it('lets "manage" satisfy a :self gate without fetching (unscoped manage bypasses self)', async () => {
    defineSubject('todo', {
      fetch: async () => ({ user_id: 'someone-else' }),
    })
    const result = await evaluateChecks(
      ['todo:delete:self'],
      makeSession({ abilities: ['todo:manage'] }),
      makeEvent({ id: 't-1' }),
    )
    expect(result.allowed).toBe(true)
  })

  it('denies when the user lacks the ability', async () => {
    const result = await evaluateChecks(['blog:read'], makeSession({ abilities: [] }), makeEvent())
    expect(result).toEqual({ allowed: false })
  })

  it('grants ":self" when ownership matches and exposes the resource as extras', async () => {
    defineSubject('blog', {
      fetch: async id => ({ id, user_id: 'user-1', title: 'hi' }),
    })
    const result = await evaluateChecks(
      ['blog:read:self'],
      makeSession({ abilities: ['blog:read:self'] }),
      makeEvent({ id: 'b-1' }),
    )
    expect(result.allowed).toBe(true)
    expect(result.extras).toEqual({ blog: { id: 'b-1', user_id: 'user-1', title: 'hi' } })
  })

  it('denies ":self" when ownership does not match', async () => {
    defineSubject('blog', {
      fetch: async () => ({ id: 'b-1', user_id: 'someone-else' }),
    })
    const result = await evaluateChecks(
      ['blog:read:self'],
      makeSession({ abilities: ['blog:read:self'] }),
      makeEvent({ id: 'b-1' }),
    )
    expect(result).toEqual({ allowed: false })
  })

  it('denies ":self" when the resource is not found', async () => {
    defineSubject('blog', { fetch: async () => null })
    const result = await evaluateChecks(
      ['blog:read:self'],
      makeSession({ abilities: ['blog:read:self'] }),
      makeEvent({ id: 'b-1' }),
    )
    expect(result).toEqual({ allowed: false })
  })

  it('respects custom paramName on subject registration', async () => {
    defineSubject('blog', {
      paramName: 'blogId',
      fetch: async id => ({ id, user_id: 'user-1' }),
    })
    const result = await evaluateChecks(
      ['blog:read:self'],
      makeSession({ abilities: ['blog:read:self'] }),
      makeEvent({ blogId: 'b-1' }),
    )
    expect(result.allowed).toBe(true)
  })

  it('throws a clear error when ":self" is used without subject registration', async () => {
    await expect(
      evaluateChecks(['blog:read:self'], makeSession({ abilities: ['blog:read:self'] }), makeEvent({ id: 'b-1' })),
    ).rejects.toThrow(/not registered/)
  })
})

describe('evaluateChecks — system ability guard (manage must not imply impersonate)', () => {
  it('denies system-specific actions when only manage is held', async () => {
    const result = await evaluateChecks(
      ['user:impersonate'],
      makeSession({ abilities: ['user:manage'] }),
      makeEvent(),
    )
    expect(result.allowed).toBe(false)
  })

  it('grants system-specific actions when held explicitly', async () => {
    const result = await evaluateChecks(
      ['user:impersonate'],
      makeSession({ abilities: ['user:impersonate'] }),
      makeEvent(),
    )
    expect(result.allowed).toBe(true)
  })
})

describe('evaluateChecks — OR semantics', () => {
  it('returns the first passing string check', async () => {
    const result = await evaluateChecks(
      ['user:read', 'blog:read'],
      makeSession({ abilities: ['blog:read'] }),
      makeEvent(),
    )
    expect(result.allowed).toBe(true)
  })

  it('falls through to a function check when string checks miss', async () => {
    const result = await evaluateChecks(
      ['blog:read', () => ({ allowed: true, blog: { id: 'b-1' } })],
      makeSession({ abilities: [] }),
      makeEvent(),
    )
    expect(result.allowed).toBe(true)
    expect(result.extras).toEqual({ blog: { id: 'b-1' } })
  })

  it('returns allowed:false when every check fails', async () => {
    const result = await evaluateChecks(
      ['blog:read', () => ({ allowed: false })],
      makeSession({ abilities: [] }),
      makeEvent(),
    )
    expect(result.allowed).toBe(false)
  })

  it('passes the H3Event and session through to function checks', async () => {
    const session = makeSession({ id: 'user-1', abilities: [] })
    const event = makeEvent({ id: 'b-1' })
    const seen: { event?: H3Event, session?: AuthUser } = {}
    await evaluateChecks(
      [(e, s) => {
        seen.event = e
        seen.session = s
        return { allowed: false }
      }],
      session,
      event,
    )
    expect(seen.event).toBe(event)
    expect(seen.session).toBe(session)
  })
})

describe('runAuthorizedHandler', () => {
  it('runs the handler with { session, ...extras } when a check passes', async () => {
    const result = await runAuthorizedHandler(
      ['blog:read'],
      makeSession({ abilities: ['blog:read'] }),
      makeEvent(),
      (_e, ctx) => ({ sessionId: ctx.session.id, ok: true }),
    )
    expect(result).toEqual({ sessionId: 'user-1', ok: true })
  })

  it('forwards extras returned by a function check into the handler context', async () => {
    const blog = { id: 'b-1', title: 'hello' }
    const result = (await runAuthorizedHandler(
      [() => ({ allowed: true, blog })],
      makeSession({ abilities: [] }),
      makeEvent(),
      (_e, ctx) => ctx,
    )) as { session: AuthUser, blog: typeof blog }
    expect(result.blog).toBe(blog)
  })

  it('throws 403 when no check passes', async () => {
    await expect(
      runAuthorizedHandler(['blog:read'], makeSession({ abilities: [] }), makeEvent(), () => ({ ok: true })),
    ).rejects.toMatchObject({ statusCode: 403 })
  })
})

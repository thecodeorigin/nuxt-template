import type { H3Event } from 'h3'
import type { AuthUser } from '#layers/auth/server/services/auth'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  _resetSubjects,
  defineSubject,
  evaluateAbilityString,
  evaluateChecks,
  hasExactAbility,
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

describe('hasExactAbility', () => {
  it('matches the literal ability string', () => {
    expect(hasExactAbility(['blog:read'], 'blog:read')).toBe(true)
  })

  it('does not treat a scoped ability as the unscoped one', () => {
    expect(hasExactAbility(['blog:read:self'], 'blog:read')).toBe(false)
    expect(hasExactAbility([], 'blog:read')).toBe(false)
  })
})

describe('evaluateAbilityString', () => {
  it('grants when the user has the exact "subject:action"', async () => {
    const session = makeSession({ abilities: ['blog:read'] })
    const result = await evaluateAbilityString('blog:read', session, {
      event: makeEvent(),
      getParam: () => undefined,
    })
    expect(result).toEqual({ allowed: true })
  })

  it('grants via the "manage" wildcard for read/write/delete on the same subject', async () => {
    const session = makeSession({ abilities: ['todo:manage'] })
    for (const required of ['todo:read', 'todo:write', 'todo:delete']) {
      const result = await evaluateAbilityString(required, session, {
        event: makeEvent(),
        getParam: () => undefined,
      })
      expect(result).toEqual({ allowed: true })
    }
  })

  it('does not let "manage" satisfy a :self gate without ownership', async () => {
    const session = makeSession({ abilities: ['todo:manage'] })
    const result = await evaluateAbilityString('todo:delete:self', session, {
      event: makeEvent({ id: 't-1' }),
      getParam: () => 't-1',
    })
    expect(result).toEqual({ allowed: false })
  })

  it('denies when the user lacks the ability', async () => {
    const session = makeSession({ abilities: [] })
    const result = await evaluateAbilityString('blog:read', session, {
      event: makeEvent(),
      getParam: () => undefined,
    })
    expect(result).toEqual({ allowed: false })
  })

  it('grants ":self" when ownership matches and exposes the resource as extras', async () => {
    defineSubject('blog', {
      fetch: async id => ({ id, user_id: 'user-1', title: 'hi' }),
    })
    const session = makeSession({ abilities: ['blog:read:self'] })
    const result = await evaluateAbilityString('blog:read:self', session, {
      event: makeEvent({ id: 'b-1' }),
      getParam: n => (n === 'id' ? 'b-1' : undefined),
    })
    expect(result.allowed).toBe(true)
    expect(result.extras).toEqual({ blog: { id: 'b-1', user_id: 'user-1', title: 'hi' } })
  })

  it('denies ":self" when ownership does not match', async () => {
    defineSubject('blog', {
      fetch: async () => ({ id: 'b-1', user_id: 'someone-else' }),
    })
    const session = makeSession({ abilities: ['blog:read:self'] })
    const result = await evaluateAbilityString('blog:read:self', session, {
      event: makeEvent({ id: 'b-1' }),
      getParam: () => 'b-1',
    })
    expect(result).toEqual({ allowed: false })
  })

  it('denies ":self" when the resource is not found', async () => {
    defineSubject('blog', { fetch: async () => null })
    const session = makeSession({ abilities: ['blog:read:self'] })
    const result = await evaluateAbilityString('blog:read:self', session, {
      event: makeEvent({ id: 'b-1' }),
      getParam: () => 'b-1',
    })
    expect(result).toEqual({ allowed: false })
  })

  it('respects custom paramName and ownerKey on subject registration', async () => {
    defineSubject('blog', {
      paramName: 'blogId',
      ownerKey: 'authorId',
      fetch: async id => ({ id, authorId: 'user-1' }),
    })
    const session = makeSession({ abilities: ['blog:read:self'] })
    const result = await evaluateAbilityString('blog:read:self', session, {
      event: makeEvent({ blogId: 'b-1' }),
      getParam: n => (n === 'blogId' ? 'b-1' : undefined),
    })
    expect(result.allowed).toBe(true)
  })

  it('throws a clear error when ":self" is used without subject registration', async () => {
    const session = makeSession({ abilities: ['blog:read:self'] })
    await expect(
      evaluateAbilityString('blog:read:self', session, {
        event: makeEvent({ id: 'b-1' }),
        getParam: () => 'b-1',
      }),
    ).rejects.toThrow(/not registered/)
  })
})

describe('evaluateChecks (defineAuthorizedHandler — OR semantics)', () => {
  it('returns the first passing string check', async () => {
    const session = makeSession({ abilities: ['blog:read'] })
    const result = await evaluateChecks(['user:read', 'blog:read'], session, makeEvent())
    expect(result.allowed).toBe(true)
  })

  it('falls through to a function check when string checks miss', async () => {
    const session = makeSession({ abilities: [] })
    const result = await evaluateChecks(
      [
        'blog:read',
        () => ({ allowed: true, blog: { id: 'b-1' } }),
      ],
      session,
      makeEvent(),
    )
    expect(result.allowed).toBe(true)
    expect(result.extras).toEqual({ blog: { id: 'b-1' } })
  })

  it('returns allowed:false when every check fails', async () => {
    const session = makeSession({ abilities: [] })
    const result = await evaluateChecks(
      ['blog:read', () => ({ allowed: false })],
      session,
      makeEvent(),
    )
    expect(result.allowed).toBe(false)
  })

  it('passes the H3Event and session through to function checks', async () => {
    const session = makeSession({ id: 'user-1', abilities: [] })
    const event = makeEvent({ id: 'b-1' })
    const seen: { event?: H3Event, session?: AuthUser } = {}
    await evaluateChecks(
      [
        (e, s) => {
          seen.event = e
          seen.session = s
          return { allowed: false }
        },
      ],
      session,
      event,
    )
    expect(seen.event).toBe(event)
    expect(seen.session).toBe(session)
  })

  it('mixes string and function checks (the canonical defineAuthorizedHandler example)', async () => {
    defineSubject('blog', {
      fetch: async id => ({ id, user_id: 'user-1' }),
    })
    const session = makeSession({ abilities: ['blog:read:self'] })
    const result = await evaluateChecks(
      [
        'blog:read',
        'blog:read:self',
        'user:read',
        async (_e, s) => ({ allowed: false, reason: `manual check for ${s.id}` }),
      ],
      session,
      makeEvent({ id: 'b-1' }),
    )
    expect(result.allowed).toBe(true)
    expect(result.extras).toEqual({ blog: { id: 'b-1', user_id: 'user-1' } })
  })
})

describe('runAuthorizedHandler', () => {
  it('runs the handler with { session, ...extras } when a check passes', async () => {
    const session = makeSession({ abilities: ['blog:read'] })
    const event = makeEvent()
    const result = await runAuthorizedHandler(
      ['blog:read'],
      session,
      event,
      (_e, ctx) => ({ sessionId: ctx.session.id, ok: true }),
    )
    expect(result).toEqual({ sessionId: 'user-1', ok: true })
  })

  it('forwards extras returned by a function check into the handler context', async () => {
    const session = makeSession({ abilities: [] })
    const blog = { id: 'b-1', title: 'hello' }
    const result = (await runAuthorizedHandler(
      [() => ({ allowed: true, blog })],
      session,
      makeEvent(),
      (_e, ctx) => ctx,
    )) as { session: AuthUser, blog: typeof blog }
    expect(result.blog).toBe(blog)
  })

  it('throws 403 when no check passes', async () => {
    const session = makeSession({ abilities: [] })
    await expect(
      runAuthorizedHandler(['blog:read'], session, makeEvent(), () => ({ ok: true })),
    ).rejects.toMatchObject({ statusCode: 403 })
  })
})

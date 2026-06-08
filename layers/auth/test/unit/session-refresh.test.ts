import type { AuthUser } from '#layers/auth/server/services/auth'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { planSessionRefresh } from '#layers/auth/server/services/session'

function session(id: string): AuthUser {
  return { id } as unknown as AuthUser
}

describe('planSessionRefresh (§4 bug 2)', () => {
  it('keeps sessions that still belong to the user', () => {
    const { toRebuild, survivingIds } = planSessionRefresh(
      [
        { sessionId: 'a', session: session('u1') },
        { sessionId: 'b', session: session('u1') },
      ],
      'u1',
    )
    expect(survivingIds).toEqual(['a', 'b'])
    expect(toRebuild.map(r => r.sessionId)).toEqual(['a', 'b'])
  })

  it('prunes dead (null) sessions — covers logout / TTL expiry without touching those paths', () => {
    const { survivingIds } = planSessionRefresh(
      [
        { sessionId: 'a', session: session('u1') },
        { sessionId: 'gone', session: null },
      ],
      'u1',
    )
    expect(survivingIds).toEqual(['a'])
  })

  it('prunes sessions reassigned to another user (impersonation drift)', () => {
    const { toRebuild, survivingIds } = planSessionRefresh(
      [
        { sessionId: 'a', session: session('u1') },
        { sessionId: 'imp', session: session('victim') },
      ],
      'u1',
    )
    expect(survivingIds).toEqual(['a'])
    expect(toRebuild).toHaveLength(1)
  })

  it('returns empty for no candidates', () => {
    expect(planSessionRefresh([], 'u1')).toEqual({ toRebuild: [], survivingIds: [] })
  })
})

// §4 bug 2: refreshUserSessions must NOT scan the whole `session:` namespace
// (O(total live sessions)). It must read the per-user index instead.
describe('refreshUserSessions complexity guard', () => {
  const src = readFileSync(join(process.cwd(), 'layers/auth/server/services/session.ts'), 'utf8')
  const fn = src.slice(src.indexOf('export async function refreshUserSessions'))

  it('does not call kv.keys (full-namespace scan)', () => {
    expect(fn).not.toMatch(/kv\.keys\(/)
  })

  it('reads the per-user session index', () => {
    expect(fn).toMatch(/userSessionsKey\(userId\)/)
  })
})

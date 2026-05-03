import type { AuthUser } from '#layers/auth/server/services/auth'
import { describe, expect, it } from 'vitest'
import {
  backupKey,
  buildImpersonatedSession,
  impersonatorInfoFromSession,
  sessionKey,
} from '#layers/auth/server/services/impersonate'

class FakeStorage {
  private map = new Map<string, unknown>()
  async setItem(k: string, v: unknown) { this.map.set(k, v) }
  async getItem<T>(k: string) { return (this.map.get(k) as T | undefined) ?? null }
  async removeItem(k: string) { this.map.delete(k) }
  has(k: string) { return this.map.has(k) }
  size() { return this.map.size }
}

const SESSION_ID = 'sess-abc'

const ADMIN: AuthUser = {
  id: 'admin-1',
  primary_email: 'admin@seed.local',
  primary_phone: null,
  username: 'admin',
  name: 'Admin',
  avatar: null,
  verified: true,
  provider: 'google',
  abilities: ['user:impersonate', 'user:read'],
}

const TARGET = {
  id: 'user-2',
  primary_email: 'bob@seed.local',
  primary_phone: null,
  username: 'bob',
  name: 'Bob',
  avatar: null,
  verified: true,
  abilities: ['todo:read'],
}

async function start(storage: FakeStorage, sessionId: string, admin: AuthUser, target: typeof TARGET) {
  await storage.setItem(backupKey(sessionId), admin)
  const newSession = buildImpersonatedSession(target, impersonatorInfoFromSession(admin))
  await storage.setItem(sessionKey(sessionId), newSession)
  return newSession
}

async function stop(storage: FakeStorage, sessionId: string) {
  const original = await storage.getItem<AuthUser>(backupKey(sessionId))
  if (!original)
    throw new Error('Backup missing')
  const restored = { ...original, impersonator: null }
  await storage.setItem(sessionKey(sessionId), restored)
  await storage.removeItem(backupKey(sessionId))
  return restored
}

describe('impersonation session roundtrip', () => {
  it('start: replaces session with target user and backs up admin', async () => {
    const storage = new FakeStorage()
    await storage.setItem(sessionKey(SESSION_ID), ADMIN)

    const after = await start(storage, SESSION_ID, ADMIN, TARGET)

    expect(after.id).toBe(TARGET.id)
    expect(after.abilities).toEqual(['todo:read'])
    expect(after.impersonator?.id).toBe(ADMIN.id)

    const live = await storage.getItem<AuthUser>(sessionKey(SESSION_ID))
    expect(live?.id).toBe(TARGET.id)

    const backup = await storage.getItem<AuthUser>(backupKey(SESSION_ID))
    expect(backup?.id).toBe(ADMIN.id)
    expect(backup?.abilities).toContain('user:impersonate')
  })

  it('stop: restores admin and removes backup', async () => {
    const storage = new FakeStorage()
    await storage.setItem(sessionKey(SESSION_ID), ADMIN)
    await start(storage, SESSION_ID, ADMIN, TARGET)

    const restored = await stop(storage, SESSION_ID)

    expect(restored.id).toBe(ADMIN.id)
    expect(restored.abilities).toContain('user:impersonate')
    expect(restored.impersonator).toBeNull()

    const live = await storage.getItem<AuthUser>(sessionKey(SESSION_ID))
    expect(live?.id).toBe(ADMIN.id)
    expect(storage.has(backupKey(SESSION_ID))).toBe(false)
  })

  it('stop: throws when no backup exists (e.g. tampering or already stopped)', async () => {
    const storage = new FakeStorage()
    await expect(stop(storage, SESSION_ID)).rejects.toThrow(/missing/i)
  })

  it('an impersonated session evaluates abilities as the target user', async () => {
    const storage = new FakeStorage()
    await start(storage, SESSION_ID, ADMIN, TARGET)
    const live = await storage.getItem<AuthUser>(sessionKey(SESSION_ID))

    expect(live?.abilities.includes('user:impersonate')).toBe(false)
    expect(live?.abilities.includes('todo:read')).toBe(true)
  })
})

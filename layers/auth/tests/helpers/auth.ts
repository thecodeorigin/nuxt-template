import type { APIRequestContext, BrowserContext } from '@playwright/test'
import { expect } from '@nuxt/test-utils/playwright'
import { request as apiRequest } from '@playwright/test'

export const COOKIE_SPLIT = /,\s*(?=\w+=)/

export const ADMIN_EMAIL = 'admin@seed.local'
export const ALICE_EMAIL = 'alice@seed.local'
export const BOB_EMAIL = 'bob@seed.local'

export const SEED_EMAILS = {
  admin: ADMIN_EMAIL,
  alice: ALICE_EMAIL,
  bob: BOB_EMAIL,
} as const

export const FORBIDDEN_URL = /\/forbidden$/

let _emailCounter = 0
export function uniqueEmail(prefix = 'e2e'): string {
  return `${prefix}-${Date.now()}-${++_emailCounter}@e2e.local`
}

const issuedSessionIds = new Set<string>()

export async function devSeed(request: APIRequestContext) {
  const res = await request.post('/api/auth/dev-seed')
  expect(res.ok()).toBeTruthy()
  return res.json() as Promise<{ users: Array<{ id: string, primary_email: string }> }>
}

export async function devLogin(baseURL: string, email: string) {
  const ctx = await apiRequest.newContext({ baseURL })
  const res = await ctx.post('/api/auth/dev-login', { data: { email } })
  expect(res.ok()).toBeTruthy()
  const body = (await res.json()) as { session_id: string, user_id: string }
  issuedSessionIds.add(body.session_id)
  await ctx.dispose()
  return body
}

export async function devProvision(baseURL: string, email: string, name?: string) {
  const ctx = await apiRequest.newContext({ baseURL })
  const res = await ctx.post('/api/auth/dev-provision', { data: { email, name } })
  expect(res.ok()).toBeTruthy()
  const body = (await res.json()) as { session_id: string, user_id: string, personal_org_id: string }
  issuedSessionIds.add(body.session_id)
  await ctx.dispose()
  return body
}

export async function devCleanup(request: APIRequestContext, emails: string[] = []) {
  await request.post('/api/auth/dev-cleanup', {
    data: { emails, session_ids: Array.from(issuedSessionIds) },
  })
  issuedSessionIds.clear()
}

export async function setCookieSession(context: BrowserContext, baseURL: string, sessionId: string) {
  await context.addCookies([{
    name: 'sessionid',
    value: sessionId,
    url: baseURL,
    httpOnly: true,
    sameSite: 'Lax',
  }])
}

/** Login via demo-login and inject the session cookie into the browser context. */
export async function demoLogin(
  request: APIRequestContext,
  context: BrowserContext,
  baseURL: string,
  agent: 'admin' | 'user',
) {
  const res = await request.post('/api/auth/demo-login', { data: { agent } })
  expect(res.ok()).toBeTruthy()
  const body = (await res.json()) as { session_id: string, user_id: string }
  await context.addCookies([{ name: 'sessionid', value: body.session_id, url: baseURL, httpOnly: true, sameSite: 'Lax' }])
  return body.session_id
}

/** Login via demo-login using a throwaway context and return the session_id (no cookie set). */
export async function demoLoginSessionId(baseURL: string, agent: 'admin' | 'user') {
  const ctx = await apiRequest.newContext({ baseURL })
  const res = await ctx.post('/api/auth/demo-login', { data: { agent } })
  expect(res.ok()).toBeTruthy()
  const body = (await res.json()) as { session_id: string, user_id: string, primary_email: string }
  await ctx.dispose()
  return { session_id: body.session_id, user_id: body.user_id, primary_email: body.primary_email }
}

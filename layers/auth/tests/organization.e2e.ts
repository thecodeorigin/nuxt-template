import { expect, test } from '@nuxt/test-utils/playwright'
import { ALICE_EMAIL, demoLoginSessionId, devCleanup, devProvision, devSeed, setCookieSession, uniqueEmail } from './helpers/auth'

const ORG_MEMBERS_URL = /\/organization\/members$/

test.beforeEach(async ({ context, baseURL }) => {
  // Use a fresh throwaway context so the test's `request` fixture stays cookie-free
  // (demoLogin via the `request` fixture would store Set-Cookie in its jar, overriding
  // x-session-id headers in API tests that share the same fixture).
  const { session_id } = await demoLoginSessionId(baseURL!, 'admin')
  await setCookieSession(context, baseURL!, session_id)
})

test('/users redirects to /organization/members', async ({ page, goto }) => {
  await goto('/users', { waitUntil: 'hydration' })
  await expect(page).toHaveURL(ORG_MEMBERS_URL)
})

test('organization general + members tabs render', async ({ page, goto }) => {
  await goto('/organization', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'Organization' })).toBeVisible()
  await page.getByRole('link', { name: 'Members' }).click()
  await expect(page).toHaveURL(ORG_MEMBERS_URL)
})

test('members tab renders the members table', async ({ page, goto }) => {
  await goto('/organization/members', { waitUntil: 'hydration' })
  // Wait for all in-flight requests (useInfiniteList + fetchRoles) to settle
  await page.waitForLoadState('networkidle')
  const membersTable = page.getByRole('table').filter({ hasText: 'Abilities' })
  await expect(membersTable).toBeVisible()
  await expect(membersTable.getByRole('row').filter({ hasText: '@' }).first()).toBeVisible()
})

test('admin can create and revoke an invitation', async ({ page, goto }) => {
  const email = `invitee-${Date.now()}@example.com`
  await goto('/organization/members', { waitUntil: 'hydration' })
  // Wait for fetchRoles to finish — its completion re-renders the form and
  // can detach the email input if we start filling before it settles
  await page.waitForLoadState('networkidle')

  const emailInput = page.getByLabel('Email', { exact: true })
  await expect(emailInput).toBeEditable()
  await emailInput.fill(email)
  await page.getByRole('button', { name: 'Generate invite link' }).click()

  await expect(page.getByText('Pending invitations')).toBeVisible()
  const row = page.getByRole('row').filter({ hasText: email })
  await expect(row).toBeVisible()

  await row.getByRole('button', { name: 'Revoke' }).click()
  await expect(page.getByText(email)).toBeHidden()
})

// ────────────────────────────────────────────────────────────────────────────
// Phase 4: isolated-owner UI + API negatives
// ────────────────────────────────────────────────────────────────────────────

test.describe('org lifecycle — isolated owner (UI)', () => {
  test('owner renames the active organization', async ({ page, request, context, baseURL, goto }) => {
    const email = uniqueEmail('rename')
    const { session_id } = await devProvision(baseURL!, email, 'Renamer')
    // Override the outer beforeEach admin cookie with the provisioned owner's session
    await setCookieSession(context, baseURL!, session_id)
    await goto('/organization', { waitUntil: 'hydration' })
    await page.waitForLoadState('networkidle')
    const input = page.getByRole('textbox').first()
    await expect(input).toBeEditable()
    await input.fill('Renamed Org')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('Organization updated', { exact: true })).toBeVisible()
    await devCleanup(request, [email])
  })
})

test.describe('org API — guards and negatives', () => {
  const seededEmails: string[] = []

  // Clear the admin cookie set by the outer beforeEach so that x-session-id headers win
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test.afterAll(async ({ request }) => {
    await devCleanup(request, seededEmails)
  })

  test('rename requires user:manage — member gets 403', async ({ request, baseURL }) => {
    const { session_id: userSid } = await demoLoginSessionId(baseURL!, 'user')
    const res = await request.patch('/api/organization', {
      headers: { 'x-session-id': userSid },
      data: { name: 'Nope' },
    })
    expect(res.status()).toBe(403)
  })

  test('direct-add member: 404 for unknown email', async ({ request, baseURL }) => {
    const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
    const res = await request.post('/api/organization/members', {
      headers: { 'x-session-id': adminSid },
      data: { email: 'nobody@nowhere.invalid' },
    })
    expect(res.status()).toBe(404)
  })

  test('direct-add member: 409 when user is already a member', async ({ request, baseURL }) => {
    const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
    const { primary_email: demoUserEmail } = await demoLoginSessionId(baseURL!, 'user')
    const res = await request.post('/api/organization/members', {
      headers: { 'x-session-id': adminSid },
      data: { email: demoUserEmail },
    })
    expect(res.status()).toBe(409)
  })

  test('cannot remove self from org — returns 403', async ({ request, baseURL }) => {
    const { session_id: adminSid, user_id: adminId } = await demoLoginSessionId(baseURL!, 'admin')
    const res = await request.delete(`/api/organization/members/${adminId}`, {
      headers: { 'x-session-id': adminSid },
    })
    expect(res.status()).toBe(403)
  })

  test('B3: direct-add grants route-local ability set (missing billing:read vs shared/permissions)', async ({ request, baseURL }) => {
    await devSeed(request)
    seededEmails.push(ALICE_EMAIL)
    const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
    const res = await request.post('/api/organization/members', {
      headers: { 'x-session-id': adminSid },
      data: { email: ALICE_EMAIL },
    })
    expect(res.ok()).toBe(true)
    const member = await res.json()
    expect(member.abilities).toContain('project:read')
    expect(member.abilities).toContain('project:write')
    expect(member.abilities).toContain('billing:read')
  })

  test('ability change is live immediately without re-login', async ({ request, baseURL }) => {
    const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
    const { session_id: userSid, user_id: userId } = await demoLoginSessionId(baseURL!, 'user')

    await request.patch(`/api/organization/members/${userId}/abilities`, {
      headers: { 'x-session-id': adminSid },
      data: { abilities: ['project:read'] },
    })
    const demoted = await (await request.get('/api/auth/me', { headers: { 'x-session-id': userSid } })).json()
    expect(demoted.abilities).toContain('project:read')
    expect(demoted.abilities).not.toContain('project:write')

    // Restore
    await request.patch(`/api/organization/members/${userId}/abilities`, {
      headers: { 'x-session-id': adminSid },
      data: { abilities: ['user:read', 'project:read', 'project:write'] },
    })
  })
})

import { expect, test } from '@nuxt/test-utils/playwright'
import { demoLogin } from './helpers/auth'

const ORG_MEMBERS_URL = /\/organization\/members$/

test.beforeEach(async ({ context, request, baseURL }) => {
  await demoLogin(request, context, baseURL!, 'admin')
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

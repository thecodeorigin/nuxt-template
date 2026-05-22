import { expect, test } from '@nuxt/test-utils/playwright'

const COOKIE_SPLIT = /,\s*(?=\w+=)/
const ORG_MEMBERS_URL = /\/organization\/members$/

test.beforeEach(async ({ context, request, baseURL }) => {
  const res = await request.post('/api/auth/demo-login', { data: { agent: 'admin' } })
  const cookies = res.headers()['set-cookie']?.split(COOKIE_SPLIT) ?? []
  const sessionid = cookies.find(c => c.startsWith('sessionid='))?.split(';')[0]?.split('=')[1]
  await context.addCookies([{ name: 'sessionid', value: sessionid!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }])
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

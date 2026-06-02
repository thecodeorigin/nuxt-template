import { expect, test } from '@nuxt/test-utils/playwright'

const COOKIE_SPLIT = /,\s*(?=\w+=)/

test.beforeEach(async ({ context, request, baseURL }) => {
  const res = await request.post('/api/auth/demo/login', { data: { agent: 'admin' } })
  expect(res.ok()).toBeTruthy()
  const cookies = res.headers()['set-cookie']?.split(COOKIE_SPLIT) ?? []
  const sessionid = cookies.find(c => c.startsWith('sessionid='))?.split(';')[0]?.split('=')[1]
  await context.addCookies([{ name: 'sessionid', value: sessionid!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }])
})

test('bell opens slideover and Load more appends', async ({ page, goto }) => {
  await goto('/dashboard', { waitUntil: 'hydration' })
  await page.getByTestId('notifications-bell').click()
  await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
  await expect(page.getByText('Jordan Brown')).toBeVisible()
  const loadMore = page.getByTestId('notifications-load-more')
  if (await loadMore.isVisible()) {
    await loadMore.click()
    await expect(page.getByText('Leonard Krasner')).toBeVisible()
  }
})

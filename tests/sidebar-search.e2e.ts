import { expect, test } from '@nuxt/test-utils/playwright'

const COOKIE_SPLIT = /,\s*(?=\w+=)/
const SEARCH_PLACEHOLDER = /Type a command or search/i

test.beforeEach(async ({ context, request, baseURL }) => {
  const res = await request.post('/api/auth/demo/login', { data: { agent: 'admin' } })
  const cookies = res.headers()['set-cookie']?.split(COOKIE_SPLIT) ?? []
  const sessionid = cookies.find(c => c.startsWith('sessionid='))?.split(';')[0]?.split('=')[1]
  await context.addCookies([{ name: 'sessionid', value: sessionid!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }])
})

test('Ctrl+K opens the command palette with Go to + Theme groups', async ({ page, goto }) => {
  await goto('/dashboard', { waitUntil: 'hydration' })
  await page.keyboard.press('Control+k')
  await expect(page.getByPlaceholder(SEARCH_PLACEHOLDER)).toBeVisible()
  await expect(page.getByText('Go to')).toBeVisible()
  await expect(page.getByText('Theme')).toBeVisible()
})

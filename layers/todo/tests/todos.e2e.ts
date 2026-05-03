import { expect, test } from '@nuxt/test-utils/playwright'

const ADD_BUTTON = /add/i
const COOKIE_SPLIT = /,\s*(?=\w+=)/

// /todos requires an authenticated session — authenticate via demo-login
// before each test so we exercise the real auth flow + middleware.
test.beforeEach(async ({ context, request, baseURL }) => {
  const res = await request.post('/api/auth/demo-login', { data: { agent: 'admin' } })
  expect(res.ok()).toBeTruthy()
  const cookies = res.headers()['set-cookie']?.split(COOKIE_SPLIT) ?? []
  const sessionid = cookies.find(c => c.startsWith('sessionid='))?.split(';')[0]?.split('=')[1]
  expect(sessionid).toBeTruthy()
  await context.addCookies([{
    name: 'sessionid',
    value: sessionid!,
    url: baseURL!,
    httpOnly: true,
    sameSite: 'Lax',
  }])
})

test('todos page renders empty state', async ({ page, goto }) => {
  await goto('/todos', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()
  await expect(page.getByPlaceholder('What needs doing?')).toBeVisible()
})

test('can create a todo', async ({ page, goto }) => {
  await goto('/todos', { waitUntil: 'hydration' })
  await page.getByPlaceholder('What needs doing?').fill('write tests')
  await page.getByRole('button', { name: ADD_BUTTON }).click()
  await expect(page.getByText('write tests')).toBeVisible()
})

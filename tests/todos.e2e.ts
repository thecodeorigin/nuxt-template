import { expect, test } from '@nuxt/test-utils/playwright'

const ADD_BUTTON = /add/i

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

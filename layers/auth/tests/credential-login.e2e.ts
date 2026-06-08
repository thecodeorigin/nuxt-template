import { expect, test } from '@playwright/test'

// Credential login is only live when the deployed worker has the generated
// admin secret set. Skip cleanly when it isn't configured for this run.
const email = process.env.NUXT_ADMIN_EMAIL
const password = process.env.NUXT_ADMIN_PASSWORD
const enabled = Boolean(email && password)

test.describe('credential login', () => {
  test.skip(!enabled, 'NUXT_ADMIN_EMAIL / NUXT_ADMIN_PASSWORD not configured')

  test('admin signs in with the generated credential', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByTestId('credential-form')).toBeVisible()
    await page.getByTestId('credential-email').fill(email!)
    await page.getByTestId('credential-password').fill(password!)
    await page.getByTestId('credential-submit').click()
    await expect(page).toHaveURL(/\/dashboard/)
  })
})

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { kebabCase } from 'lodash-es'

describe('/settings/billing-plans', () => {
  it('should display the billing plan page', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/settings/billing-plans')

    await $page.waitForSelector('[data-test="current-plan-component"]')

    const title = await $page.$('[data-test="plan-name"]')
    expect(title).not.toBeNull()

    const expiredDate = await $page.$('[data-test="plan-expired-date"]')
    expect(expiredDate).not.toBeNull()

    const planPrice = await $page.$('[data-test="plan-price"]')
    expect(planPrice).not.toBeNull()

    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__',
        `${kebabCase(task.name)}.png`,
      ),
    })
  })
})

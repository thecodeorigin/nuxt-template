import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { kebabCase } from 'lodash-es'

describe('/settings/pricing', () => {
  it('should display the pricing page', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/settings/pricing')

    await $page.waitForSelector('[data-test="pricing-list"]')

    const price = await $page.$('[data-test="pricing-price"]')
    expect(price).not.toBeNull()

    // Check if the current plan button is disabled
    const currentPlanButton = await $page.$('[data-test="current-plan-button"]')
    expect(currentPlanButton).not.toBeNull()
    const isDisabled = await currentPlanButton!.evaluate((button: any) => button.disabled)
    expect(isDisabled).toBe(true)

    // Check if the upgrade plan button is enabled
    const upgradePlanButton = await $page.$('[data-test="upgrade-plan-button"]')
    expect(upgradePlanButton).not.toBeNull()
    const isUpgradeEnabled = await upgradePlanButton!.evaluate((button: any) => button.disabled)
    expect(isUpgradeEnabled).toBe(false)

    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__',
        `${kebabCase(task.name)}.png`,
      ),
    })
  })
})

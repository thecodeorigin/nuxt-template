import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout } from 'node:timers/promises'
import { kebabCase } from 'lodash-es'

describe('/projects', () => {
  it('should display the list project page dark theme', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/projects')

    await setTimeout(1000)
    await $page.locator('[data-test="button-active-popup-theme-switcher"]').click()

    const popup = await $page.waitForSelector('[data-test="popup-theme-switcher"]')

    expect(popup).not.toBeNull()

    await $page.locator('[data-test="button-active-dark-theme"]').click()

    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__',
        `${kebabCase(task.name)}.png`,
      ),
    })
  })
})

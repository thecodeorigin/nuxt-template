import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout } from 'node:timers/promises'
import { kebabCase } from 'lodash-es'

describe('/projects', () => {
  it('display the list project page light theme', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/projects')

    await setTimeout(1000)
    await $page.locator('[data-test="button-active-popup-theme-switcher"]').click()

    const popup = await $page.waitForSelector('[data-test="popup-theme-switcher"]')
    if (!popup) {
      console.log('Popup not found')
      return
    }
    await $page.locator('[data-test="button-active-light-theme"]').click()

    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__',
        `${kebabCase(task.name)}.png`,
      ),
    })
  })
})

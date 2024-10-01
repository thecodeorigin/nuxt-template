import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { kebabCase } from 'lodash-es'

describe('/projects', () => {
  it('display the list project has delete button', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/projects')

    const gridProjects = await $page.$('[data-test="grid-list-projects"]')

    if (!gridProjects)
      return

    await $page.locator('[data-test="grid-list-projects"] div:first-child input[type="checkbox"]').click()
    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__',
        `${kebabCase(task.name)}.png`,
      ),
    })
  })
})

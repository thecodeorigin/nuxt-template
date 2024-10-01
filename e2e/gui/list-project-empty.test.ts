import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import { kebabCase } from 'lodash-es'

describe('/projects', () => {
  it('display the list project empty data', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/projects')
    const uuid = crypto.randomUUID()
    await $page.locator('[data-test="container-input-search-projects"] input[type="text"]').fill(uuid)
    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__',
        `${kebabCase(task.name)}.png`,
      ),
    })
  })
})

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { kebabCase } from 'lodash-es'

describe('/projects/create', () => {
  it('display the create project page input source url', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/projects/create')
    await $page.locator('[data-test="input-project-source-url"] input[type="text"]').fill('https://www.youtube.com/watch?v=YGBJQsNzcCs')
    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__',
        `${kebabCase(task.name)}.png`,
      ),
    })
  })
})

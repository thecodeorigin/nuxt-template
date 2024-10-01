import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout } from 'node:timers/promises'
import { kebabCase } from 'lodash-es'

describe('/projects/create', () => {
  it('display the create project page select file', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/projects/create')
    const [fileChooser] = await Promise.all([
      $page.waitForFileChooser(),
      $page.locator('[data-test="button-select-project-file"]').click(),
    ])
    await fileChooser.accept(['Random-file-names-for-automation-testing.mp4'])
    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__',
        `${kebabCase(task.name)}.png`,
      ),
    })
  })
})

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { kebabCase } from 'lodash-es'

describe('/dashboard', () => {
  it('should display the dashboard', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/dashboard')

    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__' ,
        `${kebabCase(task.name)}.png`,
      ) ,
    });
  })
})

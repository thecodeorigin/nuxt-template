import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { kebabCase } from 'lodash-es'

describe('/projects', () => {
  it('shoud display the list project page', { timeout: 0 }, async ({ task }) => {
    await $page.goto('http://localhost:3000/projects')

    const searchInputNotDisabled = await $page.$eval('[data-test="container-input-search-projects"] input[type="text"]', el => !el.disabled)
    expect(searchInputNotDisabled).toBe(true)

    await $page.locator('[data-test="container-select-category-projects"]').click()
    const listCategories = await $page.$$('.v-overlay__content.v-select__content div > .v-list-item')
    expect(listCategories.length).greaterThanOrEqual(1)

    const buttonCreateProject = await $page.$('[data-test="button-create-project"]:not([disabled])')
    expect(buttonCreateProject).not.toBeNull()

    const gridProjects = await $page.$('[data-test="grid-list-projects"]')
    if (gridProjects) {
      await $page.locator('[data-test="grid-list-projects"] div:first-child input[type="checkbox"]').click()
      const deleteButton = await $page.$('[data-test="button-delete-project"]')
      expect(deleteButton).not.toBeNull()

      const buttonDetail = await $page.$('[data-test="project-item-button-detail"]')
      expect(buttonDetail).not.toBeNull()

      const paginationContainer = await $page.$('[data-test="v-pagination-root"]')
      expect(paginationContainer).not.toBeNull()
    }

    await $page.screenshot({
      path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '__screenshots__',
        `${kebabCase(task.name)}.png`,
      ),
    })
  })
})

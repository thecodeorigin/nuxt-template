import { title } from 'node:process'
import { setTimeout } from 'node:timers/promises'

describe('/projects', () => {
  it('should search the projects match the keyword ', { timeout: 0 }, async () => {
    await $page.goto('http://localhost:3000/projects')

    const searchValue = 'test'

    await $page.locator('[data-test="container-input-search-projects"] input[type="text"]').fill(searchValue)

    $page.waitForNetworkIdle({ idleTime: 1000 })

    const gridProjects = await $page.$('[data-test="grid-list-projects"]')

    if (gridProjects) {
      const listTitles = await $page.$$eval('[data-test="project-item-title"]', titles => titles.map(title => title.textContent))
      const listDescriptions = await $page.$$eval('[data-test="project-item-description"]', list => list.map(el => el.textContent))

      if (!listTitles || listTitles.length === 0)
        return

      const check = listTitles.every((title, index) => {
        return title?.toLowerCase().includes(searchValue) || listDescriptions[index]?.toLowerCase().includes(searchValue)
      })

      expect(check).toBe(true)
    }

    await $page.locator('[data-test="container-select-category-projects"]').click()

    const listCategories = await $page.$$('.v-overlay__content.v-select__content div > .v-list-item')

    expect(listCategories.length).greaterThanOrEqual(1)

    for (const index in listCategories) {
      if (index !== '0') {
        listCategories[index]?.click()
        break
      }
    }

    $page.waitForNetworkIdle({ idleTime: 1000 })

    await setTimeout(1000)

    const categoryTitle = await $page.$eval('[data-test="container-select-category-projects"] .v-select__selection-text', el => el.textContent)

    const listTitles = await $page.$$eval('[data-test="project-item-category-title"]', titles => titles.map(title => title.textContent))

    if (listTitles.length > 0) {
      const check = listTitles.every((title) => {
        return title === categoryTitle
      })

      expect(check).toBe(true)
    }
  })
})

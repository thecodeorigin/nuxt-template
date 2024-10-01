import { setTimeout } from 'node:timers/promises'

describe('/projects', () => {
  it('should filter the projects match the category  ', { timeout: 0 }, async () => {
    await $page.goto('http://localhost:3000/projects')

    await $page.locator('[data-test="container-select-category-projects"]').click()

    const listCategories = await $page.$$('.v-overlay__content.v-select__content div > .v-list-item')

    if (listCategories.length === 1)
      return

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

    if (listTitles.length === 0)
      return

    const check = listTitles.every((title) => {
      return title === categoryTitle
    })

    expect(check).toBe(true)
  })
})

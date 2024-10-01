import { title } from 'node:process'
import { setTimeout } from 'node:timers/promises'

// describe('/projects', () => {
//   it('should search the projects match the keyword ', { timeout: 0 }, async () => {
//     await $page.goto('http://localhost:3000/projects')

//     const searchValue = 'test'

//     await $page.locator('[data-test="container-input-search-projects"] input[type="text"]').fill(searchValue)

//     $page.waitForNetworkIdle({ idleTime: 1000 })

//     const listTitles = await $page.$$eval('[data-test="project-item-title"]', titles => titles.map(title => title.textContent))
//     const listDescriptions = await $page.$$eval('[data-test="project-item-description"]', list => list.map(el => el.textContent))

//     if (listTitles.length === 0)
//       return

//     const check = listTitles.every((title, index) => {
//       return title?.toLowerCase().includes(searchValue) || listDescriptions[index]?.toLowerCase().includes(searchValue)
//     })

//     expect(check).toBe(true)
//   })
// })
describe('/projects', () => {
  it('should search the projects match the keyword ', { timeout: 0 }, async () => {
    await $page.goto('http://localhost:3000/projects')

    const searchValue = 'test'

    await $page.locator('[data-test="container-input-search-projects"] input[type="text"]').fill(searchValue)

    $page.waitForNetworkIdle({ idleTime: 1000 })

    const gridProjects = await $page.$('[data-test="grid-list-projects"]')

    // console.log('got it - grid project check')

    if (!gridProjects)
      return

    // console.log('got it - grid project passed')
    const listTitles = await $page.$$eval('[data-test="project-item-title"]', titles => titles.map(title => title.textContent))
    const listDescriptions = await $page.$$eval('[data-test="project-item-description"]', list => list.map(el => el.textContent))

    // console.log('got it - check list')
    if (!listTitles || listTitles.length === 0)
      return

    const check = listTitles.every((title, index) => {
      return title?.toLowerCase().includes(searchValue) || listDescriptions[index]?.toLowerCase().includes(searchValue)
    })

    // console.log('got it - check:', check)
    expect(check).toBe(true)
  })
})

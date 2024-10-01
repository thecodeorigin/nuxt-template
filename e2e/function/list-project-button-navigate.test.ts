import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { kebabCase } from 'lodash-es'

describe('/projects', () => {
  it('should redirect to detail project page', { timeout: 0 }, async () => {
    await $page.goto('http://localhost:3000/projects')

    const buttonDetail = await $page.$('[data-test="project-item-button-detail"]:not([disabled])')
    if (!buttonDetail)
      return
    buttonDetail.click()

    await $page.waitForNavigation({ waitUntil: 'networkidle0' })

    let currentURL = $page.url()

    expect(currentURL).toContain('/projects/')

    await $page.goto('http://localhost:3000/projects')

    await $page.locator('[data-test="button-create-project"]:not([disabled])').click()

    await $page.waitForNavigation({ waitUntil: 'networkidle0' })

    currentURL = $page.url()

    expect(currentURL).toContain('/projects/create')
  })
})

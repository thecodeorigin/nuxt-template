import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { kebabCase } from 'lodash-es'

describe('/projects', () => {
  it('should redirect to detail project page', { timeout: 0 }, async () => {
    await $page.goto('http://localhost:3000/projects')

    const buttonDetail = await $page.$('[data-test="button-detail-project"]:not([disabled])')
    if (!buttonDetail)
      return
    buttonDetail.click()

    await $page.waitForNavigation({ waitUntil: 'networkidle0' })

    const currentURL = $page.url()

    console.log(currentURL)

    expect(currentURL).toContain('/projects/')
  })
})

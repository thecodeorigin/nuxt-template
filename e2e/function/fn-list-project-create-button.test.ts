describe('/projects', () => {
  it('should redirect to create project page', { timeout: 0 }, async () => {
    await $page.goto('http://localhost:3000/projects')

    await $page.locator('[data-test="button-create-project"]:not([disabled])').click()

    await $page.waitForNavigation({ waitUntil: 'networkidle0' })

    const currentURL = $page.url()

    console.log(currentURL)

    expect(currentURL).toContain('/projects/create')
  })
})

describe('/dashboard', () => {
  it('should display the dashboard', { timeout: 0 }, async () => {
    await $page.goto('http://localhost:3000/dashboard')

    const dashboardHTML = await $page.$eval('[data-test="dashboard"]', (el) => el.innerHTML)

    expect(dashboardHTML).toContain('Welcome to Nuxt Dashboard')
  })
})

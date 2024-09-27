describe('/dashboard', () => {
  it('should display the dashboard', async () => {
    await globalThis.$page.goto('http://localhost:3000/dashboard')

    const dashboardHTML = await globalThis.$page.$eval('[data-test="dashboard"]', (el) => el.innerHTML)

    expect(dashboardHTML).toContain('Welcome to Nuxt Dashboard')
  }, { timeout: 0 })
})

import type { CookieParam } from 'puppeteer'
import puppeteer from 'puppeteer'
import cookies from './cookies.json'

function createCookie(name: string, value: string): CookieParam {
  return {
    domain: 'localhost',
    url: 'http://localhost:3000',
    name,
    value
  }
}

beforeAll(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setViewport({ width: 1920, height: 1080 })

  await page.setCookie(...cookies.map(({ name, value }) => createCookie(name, value)))

  globalThis.$page = page

  return async () => {
    await browser.close()
  }
})

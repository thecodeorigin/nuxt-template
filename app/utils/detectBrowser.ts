export function isInBrowser() {
  const userAgent = navigator.userAgent
  const browsers = [
    { name: 'Mozilla Firefox', keyword: 'Firefox' },
    { name: 'Google Chrome', keyword: 'Chrome' },
    { name: 'Apple Safari', keyword: 'Safari' },
    { name: 'Opera', keyword: 'Opera' },
    { name: 'Opera', keyword: 'OPR' },
    { name: 'Microsoft Edge', keyword: 'Edge' },
    { name: 'Internet Explorer', keyword: 'Trident' },
  ]

  for (const browser of browsers) {
    if (userAgent.includes(browser.keyword)) {
      return browser.name
    }
  }

  return false
}

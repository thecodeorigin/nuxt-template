import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'

const toastAdd = vi.fn()
const cookieValue = { current: null as string | null }

mockNuxtImport('useToast', () => () => ({ add: toastAdd }))
mockNuxtImport('useCookie', () => () => ({
  get value() {
    return cookieValue.current
  },
}))

describe('useCookieConsent.prompt', () => {
  it('adds the toast once when no consent cookie is set', async () => {
    toastAdd.mockClear()
    cookieValue.current = null
    const { useCookieConsent } = await import('~/composables/useCookieConsent')
    useCookieConsent().prompt()
    expect(toastAdd).toHaveBeenCalledOnce()
    expect(toastAdd.mock.calls[0]![0]).toMatchObject({ id: 'cookie-consent', duration: 0 })
  })

  it('does nothing when consent already set', async () => {
    toastAdd.mockClear()
    cookieValue.current = 'accepted'
    const { useCookieConsent } = await import('~/composables/useCookieConsent')
    useCookieConsent().prompt()
    expect(toastAdd).not.toHaveBeenCalled()
  })
})

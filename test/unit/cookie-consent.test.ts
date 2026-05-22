import { describe, expect, it, vi } from 'vitest'

const toastAdd = vi.fn()
vi.stubGlobal('useToast', () => ({ add: toastAdd }))

describe('useCookieConsent.prompt', () => {
  it('adds the toast once when no consent cookie is set', async () => {
    vi.stubGlobal('useCookie', () => ({ value: null }))
    const { useCookieConsent } = await import('~/composables/useCookieConsent')
    useCookieConsent().prompt()
    expect(toastAdd).toHaveBeenCalledOnce()
    expect(toastAdd.mock.calls[0]![0]).toMatchObject({ id: 'cookie-consent', duration: 0 })
  })

  it('does nothing when consent already set', async () => {
    toastAdd.mockClear()
    vi.stubGlobal('useCookie', () => ({ value: 'accepted' }))
    const { useCookieConsent } = await import('~/composables/useCookieConsent')
    useCookieConsent().prompt()
    expect(toastAdd).not.toHaveBeenCalled()
  })
})

export function useCookieConsent() {
  const consent = useCookie<string | null>('cookie-consent', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  const toast = useToast()

  function prompt() {
    if (consent.value)
      return
    toast.add({
      id: 'cookie-consent',
      title: 'We use first-party cookies to enhance your experience on our website.',
      duration: 0,
      close: false,
      actions: [{
        label: 'Accept',
        color: 'neutral',
        variant: 'outline',
        onClick: () => { consent.value = 'accepted' },
      }, {
        label: 'Opt out',
        color: 'neutral',
        variant: 'ghost',
        onClick: () => { consent.value = 'opted-out' },
      }],
    })
  }

  return { consent, prompt }
}

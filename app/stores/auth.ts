export const useAuthStore = defineStore('auth', () => {
  const crsfToken = computed(() => {
    if (import.meta.server)
      return useNuxtApp().ssrContext?.event?.context?.csrfToken

    return window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  })

  return {
    crsfToken,
  }
})

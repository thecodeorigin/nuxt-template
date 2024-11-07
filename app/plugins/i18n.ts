import { cookieRef } from '@base/@layouts/stores/config'

export default defineNuxtPlugin({
  name: 'vue-i18n',
  parallel: true,
  setup(nuxtApp) {
    const authStore = useAuthStore()

    if (authStore.currentUser?.language)
      cookieRef('language', 'en').value = authStore.currentUser.language

    nuxtApp.hook('i18n:localeSwitched', ({ newLocale }) => {
      authStore.updateCurrentUser({ language: newLocale })
    })
  },
})

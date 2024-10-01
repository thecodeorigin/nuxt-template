export default defineNuxtPlugin({
  name: 'vue-i18n',
  parallel: true,
  setup(nuxtApp) {
    nuxtApp.hook('i18n:beforeLocaleSwitch', ({ oldLocale, newLocale, initialSetup, context }) => {
      console.log('onBeforeLanguageSwitch', oldLocale, newLocale, initialSetup, context)
    })

    // called right after a new locale has been set
    nuxtApp.hook('i18n:localeSwitched', ({ oldLocale, newLocale }) => {
      console.log('onLanguageSwitched', oldLocale, newLocale)
    })
  },
})

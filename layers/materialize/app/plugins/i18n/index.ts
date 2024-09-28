import { createI18n } from 'vue-i18n'
import { cookieRef } from '@materialize/@layouts/stores/config'
import { themeConfig } from '@materialize/config'

const messages = Object.fromEntries(
  Object.entries(
    import.meta.glob<{ default: any }>('./locales/*.json', { eager: true }),
  )
    .map(([key, value]) => [key.slice(10, -5), value.default]),
)

let _i18n: any = null

export function getI18n() {
  if (_i18n === null) {
    _i18n = createI18n({
      legacy: false,
      locale: cookieRef('language', themeConfig.app.i18n.defaultLocale).value,
      fallbackLocale: 'en',
      messages,
    })
  }

  return _i18n
}

export default defineNuxtPlugin({
  name: 'vue-i18n',
  parallel: true,
  setup(nuxtApp) {
    nuxtApp.vueApp.use(getI18n())
  },
})

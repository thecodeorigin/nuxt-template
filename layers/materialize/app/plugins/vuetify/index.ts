import { deepMerge } from '@antfu/utils'
import { useI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { cookieRef } from '@materialize/@layouts/stores/config'
import { themeConfig } from '@materialize/config'
import { getI18n } from '@materialize/plugins/i18n/index'
import defaults from './defaults'
import { icons } from './icons'
import { staticPrimaryColor, staticPrimaryDarkenColor, themes } from './theme'

// Styles
import '@materialize/@core/scss/template/libs/vuetify/index.scss'
import 'vuetify/styles'

export default defineNuxtPlugin({
  name: 'vuetify',
  parallel: true,
  setup(nuxtApp) {
    const cookieThemeValues = {
      defaultTheme: resolveVuetifyTheme(themeConfig.app.theme),
      themes: {
        light: {
          colors: {
            'primary': cookieRef('lightThemePrimaryColor', staticPrimaryColor).value,
            'primary-darken-1': cookieRef('lightThemePrimaryDarkenColor', staticPrimaryDarkenColor).value,
          },
        },
        dark: {
          colors: {
            'primary': cookieRef('darkThemePrimaryColor', staticPrimaryColor).value,
            'primary-darken-1': cookieRef('darkThemePrimaryDarkenColor', staticPrimaryDarkenColor).value,
          },
        },
      },
    }

    const optionTheme = deepMerge({ themes }, cookieThemeValues)

    const vuetify = createVuetify({
      ssr: true,
      aliases: {
        IconBtn: VBtn,
      },
      defaults,
      icons,
      theme: optionTheme,
      locale: {
        adapter: createVueI18nAdapter({ i18n: getI18n(), useI18n }),
      },
    })

    nuxtApp.vueApp.use(vuetify)
  },
})

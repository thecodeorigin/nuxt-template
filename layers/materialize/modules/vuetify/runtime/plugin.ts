import { deepMerge } from '@antfu/utils'
// import { useI18n } from 'vue-i18n'
// import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
// import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { cookieRef } from '@materialize/@layouts/stores/config'
import { themeConfig } from '@materialize/config'
// import { getI18n } from '@materialize/plugins/i18n/index'
import defaults from './defaults'
import { icons } from './icons'
import { staticPrimaryColor, staticPrimaryDarkenColor, themes } from './theme'
import { defineNuxtPlugin } from '#imports'

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

    nuxtApp.hook('vuetify:before-create', ({ vuetifyOptions }) => {
      vuetifyOptions.aliases = {
        IconBtn: VBtn,
      }
      vuetifyOptions.defaults = defaults
      vuetifyOptions.icons = icons
      vuetifyOptions.theme = optionTheme
    })
  },
})

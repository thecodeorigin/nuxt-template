import type { ThemeDefinition } from 'vuetify'
import { deepMerge } from '@antfu/utils'
import { VBtn } from 'vuetify/components/VBtn'
import { cookieRef } from '@base/@layouts/stores/config'
import { themeConfig } from '@base/config'
import defaults from './defaults'
import { icons } from './icons'
import { getTheme } from './theme'
import { defineNuxtPlugin } from '#imports'

// Styles
import '@base/@core/scss/template/libs/vuetify/index.scss'
import 'vuetify/styles'

export default defineNuxtPlugin({
  name: 'vuetify',
  parallel: true,
  setup(nuxtApp) {
    const themes = getTheme()

    const cookieThemeValues = {
      defaultTheme: resolveVuetifyTheme(themeConfig.app.theme),
      themes: {
        light: {
          colors: {
            'primary': cookieRef('lightThemePrimaryColor', themes.light.colors.primary).value,
            'primary-darken-1': cookieRef('lightThemePrimaryDarkenColor', themes.light.colors['primary-darken-1']).value,
          },
        },
        dark: {
          colors: {
            'primary': cookieRef('darkThemePrimaryColor', themes.dark.colors.primary).value,
            'primary-darken-1': cookieRef('darkThemePrimaryDarkenColor', themes.dark.colors['primary-darken-1']).value,
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
      vuetifyOptions.theme = optionTheme as any
    })
  },
})

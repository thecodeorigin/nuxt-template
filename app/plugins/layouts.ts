import type { PartialDeep } from 'type-fest'
import type { LayoutConfig } from '@layouts/types'
import { layoutConfig } from '@themeConfig'

// Styles
import { createLayouts } from '@layouts'
import '@layouts/styles/index.scss'

export default defineNuxtPlugin({
  parallel: true,
  setup(nuxtApp) {
    nuxtApp.vueApp.use(createLayouts(layoutConfig as PartialDeep<LayoutConfig>))
  },
})

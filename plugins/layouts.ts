import { createLayouts } from '@layouts'

import { layoutConfig } from '@themeConfig'

// Styles
import type { PartialDeep } from 'type-fest'
import type { LayoutConfig } from '@/@layouts/types'
import '@layouts/styles/index.scss'

export default defineNuxtPlugin({
  parallel: true,
  setup(nuxtApp) {
    nuxtApp.vueApp.use(createLayouts(layoutConfig as PartialDeep<LayoutConfig>))
  },
})

import { createLayouts } from '@layouts'

import { layoutConfig } from '@themeConfig'

// Styles
import type { LayoutConfig } from '@/@layouts/types'
import '@layouts/styles/index.scss'
import type { PartialDeep } from 'type-fest'

export default defineNuxtPlugin(nuxtApp => {
  // ℹ️ We generate layout config from our themeConfig so you don't have to write config twice
  nuxtApp.vueApp.use(createLayouts(layoutConfig as PartialDeep<LayoutConfig>))
})

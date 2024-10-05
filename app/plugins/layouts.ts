import type { PartialDeep } from 'type-fest'
import type { LayoutConfig } from '@base/@layouts/types'
import { layoutConfig } from '@base/config'

// Styles
import { createLayouts } from '@base/@layouts'
import '@base/@layouts/styles/index.scss'

export default defineNuxtPlugin({
  parallel: true,
  setup(nuxtApp) {
    nuxtApp.vueApp.use(createLayouts(layoutConfig as PartialDeep<LayoutConfig>))
  },
})

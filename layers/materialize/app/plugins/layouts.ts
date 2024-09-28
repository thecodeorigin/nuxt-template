import type { PartialDeep } from 'type-fest'
import type { LayoutConfig } from '@materialize/@layouts/types'
import { layoutConfig } from '@materialize/config'

// Styles
import { createLayouts } from '@materialize/@layouts'
import '@materialize/@layouts/styles/index.scss'

export default defineNuxtPlugin({
  parallel: true,
  setup(nuxtApp) {
    nuxtApp.vueApp.use(createLayouts(layoutConfig as PartialDeep<LayoutConfig>))
  },
})

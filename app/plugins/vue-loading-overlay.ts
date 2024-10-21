import type { Props } from 'vue-loading-overlay'
import { LoadingPlugin } from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  const pluginOptions: Props = {}

  nuxtApp.vueApp.use(LoadingPlugin, pluginOptions)
})

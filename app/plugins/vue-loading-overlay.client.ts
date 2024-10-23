import * as Loading from 'vue-loading-overlay'

import 'vue-loading-overlay/dist/css/index.css'

export default defineNuxtPlugin(() => {
  const loading = Loading.useLoading()

  return {
    provide: {
      loading,
    },
  }
})

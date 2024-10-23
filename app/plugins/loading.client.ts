import { loading } from '#imports'

export default defineNuxtPlugin({
  name: 'loading-service',
  parallel: true,
  setup(nuxtApp) {
    nuxtApp.hook('app:created', (vueApp) => {
      loading._context = vueApp._context
    })

    return {
      provide: {
        loading,
      },
    }
  },
})

import { confirmation } from '#imports'

export default defineNuxtPlugin({
  name: 'confirmation-service',
  parallel: true,
  setup(nuxtApp) {
    nuxtApp.hook('app:created', (vueApp) => {
      confirmation._context = vueApp._context
    })

    return {
      provide: {
        confirmation,
      },
    }
  },
})

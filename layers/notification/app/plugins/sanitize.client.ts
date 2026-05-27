import { vSanitize } from '#layers/notifications/app/utils/sanitize'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('sanitize', vSanitize)
})

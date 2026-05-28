import { vSanitize } from '#layers/notification/app/utils/sanitize'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('sanitize', vSanitize)
})

import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  extends: [
    '@imrim12/base',
  ],

  app: {
    head: {
      titleTemplate: '%s - NuxtJS Admin Template',
      title: 'Nuxt Template',
    },
  },

  /*
    ❗ Please read the docs before updating runtimeConfig
    https://nuxt.com/docs/guide/going-further/runtime-config
  */
  runtimeConfig: {
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    },
  },

  components: {
    dirs: [
      {
        path: '@/app/components',
        pathPrefix: false,
      },
    ],
  },

  pinia: {
    storesDirs: [
      fileURLToPath(new URL('./app/stores', import.meta.url)),
    ],
  },

  alias: {
    '@': fileURLToPath(new URL('.', import.meta.url)),
    '@stores': fileURLToPath(new URL('./app/stores', import.meta.url)),
    '@plugins': fileURLToPath(new URL('./app/plugins', import.meta.url)),
    '@utils': fileURLToPath(new URL('./app/utils', import.meta.url)),
  },
})

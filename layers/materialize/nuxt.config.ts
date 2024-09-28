import { fileURLToPath } from 'node:url'
import vueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vuetify from 'vite-plugin-vuetify'
import svgLoader from 'vite-svg-loader'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  app: {
    head: {
      titleTemplate: '%s - NuxtJS Admin Template',
      title: 'Nuxt Template',

      link: [{
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      }],
    },

    pageTransition: {
      name: 'app-transition-slide-fade',
      mode: 'out-in',
    },

    layoutTransition: {
      name: 'app-transition-slide-fade',
      mode: 'out-in',
    },
  },

  devServer: {
    port: 3000,
  },

  devtools: {
    enabled: true,
  },
  
  css: [
    '@materialize/@core/scss/template/index.scss',
    '@materialize/styles/styles.scss',
    '@materialize/plugins/iconify/icons.css',
  ],

  /*
    ❗ Please read the docs before updating runtimeConfig
    https://nuxt.com/docs/guide/going-further/runtime-config
  */
  runtimeConfig: {
    // Private keys are only available on the server
    AUTH_ORIGIN: process.env.NUXT_PUBLIC_APP_BASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,

    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
      FIREBASE_KEY_PAIR: process.env.FIREBASE_KEY_PAIR,
    },
  },

  components: {
    dirs: [
      {
        path: '@materialize/@core/components',
        pathPrefix: false,
      },
      {
        path: '@materialize/components',
        pathPrefix: false,
      }
    ],
  },

  auth: {
    baseURL: process.env.NUXT_PUBLIC_APP_BASE_URL,
    globalAppMiddleware: false,

    provider: {
      type: 'authjs',
    },
  },
  
  plugins: [
    '@materialize/plugins/vuetify/index.ts',
    '@materialize/plugins/i18n/index.ts',
    '@materialize/plugins/iconify/index.ts',
  ],

  imports: {
    dirs: [
      // './app/@core/utils',
      // './app/@core/composable',
      fileURLToPath(new URL('./app/@core/utils', import.meta.url)),
      fileURLToPath(new URL('./app/@core/composable', import.meta.url)),
    ],
    presets: ['vue-i18n'],
  },

  experimental: {
    typedPages: true,
  },

  alias: {
    '@materialize/config': fileURLToPath(new URL('./app/config', import.meta.url)),
    '@materialize/@core': fileURLToPath(new URL('./app/@core', import.meta.url)),
    '@materialize/@layouts': fileURLToPath(new URL('./app/@layouts', import.meta.url)),
    '@materialize/validators': fileURLToPath(new URL('./app/@core/utils/validators', import.meta.url)),
    '@materialize/images': fileURLToPath(new URL('./app/assets/images/', import.meta.url)),
    '@materialize/styles': fileURLToPath(new URL('./app/assets/styles/', import.meta.url)),
    '@materialize/plugins': fileURLToPath(new URL('./app/plugins', import.meta.url)),
    '@materialize/configured-variables': fileURLToPath(new URL('./app/assets/styles/variables/_template.scss', import.meta.url)),
    '@materialize': fileURLToPath(new URL('./app', import.meta.url)),
  },

  // ℹ️ Disable source maps until this is resolved: https://github.com/vuetifyjs/vuetify-loader/issues/290
  sourcemap: {
    server: false,
    client: false,
  },

  vue: {
    compilerOptions: {
      isCustomElement: tag => tag === 'swiper-container' || tag === 'swiper-slide',
    },
  },

  vite: {
    define: { 'process.env': {} },

    build: {
      chunkSizeWarningLimit: 5000,
    },

    optimizeDeps: {
      exclude: ['vuetify'],
      entries: [
        './**/*.vue',
      ],
    },

    plugins: [
      svgLoader(),
      vuetify({
        // styles: {
        //   configFile: fileURLToPath(new URL('./app/assets/styles/variables/_vuetify.scss', import.meta.url)),
        // },
      }),
      vueI18nPlugin({
        runtimeOnly: true,
        compositionOnly: true,
        ssr: true,
        include: [
          fileURLToPath(new URL('./plugins/i18n/locales/**', import.meta.url)),
        ],
      }),
    ],
  },
  
  pinia: {
    storesDirs: [
      fileURLToPath(new URL('./app/stores', import.meta.url)),
    ]
  },

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    '@vueuse/nuxt',
    '@nuxtjs/device',
    '@sidebase/nuxt-auth',
    '@pinia/nuxt',
    'nuxt-vuefire',
  ],

  vuefire: {
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DB_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },

  compatibilityDate: '2024-07-12',
})

import { fileURLToPath } from 'node:url'

import svgLoader from 'vite-svg-loader'

import { version as appVersion } from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  app: {
    head: {
      titleTemplate: '%s - NuxtJS Admin Template',
      title: process.env.NUXT_PUBLIC_APP_NAME || 'nuxt-template',

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
    '@base/@core/scss/template/index.scss',
    '@base/styles/styles.scss',
    '@base/plugins/iconify/icons.css',
  ],

  /*
    ❗ Please read the docs before updating runtimeConfig
    https://nuxt.com/docs/guide/going-further/runtime-config
  */
  runtimeConfig: {
    auth: {
      secret: process.env.AUTH_SECRET,
    },

    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    },

    mongodb: {
      connectionString: process.env.MONGODB_CONNECTION_STRING,
      databaseName: process.env.MONGODB_DATABASE_NAME,
      collectionName: process.env.MONGODB_COLLECTION_NAME,
    },

    public: {
      appVersion,
      appBaseUrl: process.env.NUXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',

      theme: {
        appLogo: process.env.NUXT_PUBLIC_APP_LOGO || '/images/logo.svg',
        appName: process.env.NUXT_PUBLIC_APP_NAME || 'nuxt-template',
        primaryColor: process.env.NUXT_PUBLIC_THEME_PRIMARY_COLOR || '#666CFF',
        primaryDarkenColor: process.env.NUXT_PUBLIC_THEME_PRIMARY_DARKEN_COLOR || '#5C61E6',
      },

      firebase: {
        keyPair: process.env.FIREBASE_KEY_PAIR,
      },

      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT,
        release: process.env.SENTRY_RELEASE,
        tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE),
        replaysOnErrorSampleRate: Number(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE),
      },
    },
  },

  components: {
    dirs: [
      {
        path: '@base/@core/components',
        pathPrefix: false,
      },
      {
        path: '@base/@layouts/components',
        extensions: ['.tsx', '.vue'],
        pathPrefix: false,
      },
      {
        path: '@base/components',
        extensions: ['.vue'],
        pathPrefix: false,
      },
    ],
  },

  auth: {
    baseURL: process.env.NUXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000',
    globalAppMiddleware: false,

    provider: {
      type: 'authjs',
    },
  },

  plugins: [
    '@base/plugins/iconify/index.ts',
  ],

  imports: {
    dirs: [
      // './app/@core/utils',
      // './app/@core/composable',
      fileURLToPath(new URL('./app/@core/utils', import.meta.url)),
      fileURLToPath(new URL('./app/@core/composable', import.meta.url)),
    ],
  },

  experimental: {
    typedPages: true,
  },

  alias: {
    '@base/validators': fileURLToPath(new URL('./app/@core/utils/validators', import.meta.url)),
    '@base/images': fileURLToPath(new URL('./app/assets/images/', import.meta.url)),
    '@base/styles': fileURLToPath(new URL('./app/assets/styles/', import.meta.url)),
    '@base/configured-variables': fileURLToPath(new URL('./app/assets/styles/variables/_template.scss', import.meta.url)),
    '@base/server': fileURLToPath(new URL('./server', import.meta.url)),
    '@base': fileURLToPath(new URL('./app', import.meta.url)),
    // Bug fix:
    // 'vue-toastification': 'vue-toastification/dist/index.mjs',
  },

  // ℹ️ Disable source maps until this is resolved: https://github.com/vuetifyjs/vuetify-loader/issues/290
  sourcemap: {
    server: true,
    client: true,
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
    ],
  },

  nitro: {
    devProxy: {
      host: 'localhost',
    },

    // noExternals: true,
    externals: {
      inline: [
        'import-in-the-middle',
      ],
    },
    // externals: [
    //   'import-in-the-middle',
    // ],
  },

  pinia: {
    storesDirs: [
      fileURLToPath(new URL('./app/stores', import.meta.url)),
    ],
  },

  i18n: {
    lazy: true,
    baseUrl: process.env.NUXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000',
    strategy: 'no_prefix',
    defaultLocale: 'en',
    vueI18n: fileURLToPath(new URL('./i18n.config.ts', import.meta.url)),
    bundle: {
      runtimeOnly: true,
      compositionOnly: true,
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'nuxt-template-language',
    },
    langDir: 'assets/locale',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        name: 'English',
        dir: 'ltr',
        file: {
          path: 'en.json',
          cache: true,
        },
      },
      {
        code: 'vi',
        language: 'vi-VN',
        name: 'Tiếng Việt',
        dir: 'ltr',
        file: {
          path: 'vi.json',
          cache: true,
        },
      },
    ],
  },

  modules: [
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxtjs/device',
    '@nuxtjs/i18n',
    '@sidebase/nuxt-auth',
    '@pinia/nuxt',
    'nuxt-vuefire',
    'nuxt-nodemailer',
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

  nodemailer: process.env.NODE_ENV === 'development'
    ? {
        from: process.env.SMTP_FROM,
        host: process.env.SMTP_SERVER,
        port: Number(process.env.SMTP_PORT),
      }
    : {
        from: process.env.SMTP_FROM,
        host: process.env.SMTP_SERVER,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },

  eslint: {
    config: {
      standalone: false,
    },
  },

  compatibilityDate: '2024-07-12',
})

import { fileURLToPath } from 'node:url'
import { UserScope } from '@logto/node'

import { version as appVersion } from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  site: {
    url: process.env.NUXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000',
    name: process.env.NUXT_PUBLIC_APP_NAME || 'nuxt-template',
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
  },

  devServer: {
    port: 3000,
  },

  devtools: {
    enabled: true,
  },

  modules: [
    '@nuxt/ui-pro',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/device',
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    '@logto/nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-security',
    'nuxt-gtag',
    'nuxt-og-image',
    'nuxt-nodemailer',
    'nuxt-vuefire',
    '@nuxt/content',
  ],

  css: ['@base/assets/css/main.css'],

  /*
    ❗ Please read the docs before updating runtimeConfig
    https://nuxt.com/docs/guide/going-further/runtime-config
  */
  runtimeConfig: {
    auth: {
      secret: process.env.AUTH_SECRET,
    },

    logto: {
      endpoint: process.env.LOGTO_ENDPOINT,
      appId: process.env.LOGTO_APP_ID,
      appSecret: process.env.LOGTO_APP_SECRET,
      cookieEncryptionKey: process.env.LOGTO_COOKIE_ENCRYPTION_KEY,
      fetchUserInfo: true,
      postCallbackRedirectUri: '/app',
      postLogoutRedirectUri: '/',
      resources: [
        process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      ],
      scopes: [
        UserScope.Profile,
        UserScope.Identities,
        UserScope.Email,
        UserScope.Profile,
        UserScope.Roles,
        UserScope.Organizations,
        UserScope.OrganizationRoles,
        UserScope.CustomData,
      ],
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

    payos: {
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY,
      cancelUrl: process.env.PAYOS_CANCEL_URL,
      returnUrl: process.env.PAYOS_RETURN_URL,
    },

    public: {
      appVersion,
      appDeploymentID: process.env.NUXT_PUBLIC_APP_DEPLOYMENT_ID || appVersion,
      appCredit: process.env.NUXT_PUBLIC_APP_CREDIT || 'Thecodeorigin',
      appCreditURL: process.env.NUXT_PUBLIC_APP_CREDIT_URL || 'http://thecodeorigin.com',
      appCreditEmail: process.env.NUXT_PUBLIC_APP_CREDIT_EMAIL || 'contact@thecodeorigin.com',
      appBaseUrl: process.env.NUXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || process.env.NUXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000',
      appPaymentRedirect: process.env.NUXT_PUBLIC_APP_PAYMENT_REDIRECT || '/app/app/settings/credit',

      features: {
        credit: Boolean(process.env.FEATURE_CREDIT),
        subscription: Boolean(process.env.FEATURE_SUBSCRIPTION),
        authorization: Boolean(process.env.FEATURE_AUTHORIZATION),
      },

      theme: {
        appLogo: process.env.NUXT_PUBLIC_APP_LOGO || '/images/logo.svg',
        appName: process.env.NUXT_PUBLIC_APP_NAME || 'nuxt-template',
        lightColor: process.env.NUXT_PUBLIC_THEME_LIGHT_COLOR || '#ffffff',
        darkColor: process.env.NUXT_PUBLIC_THEME_DARK_COLOR || '#111827',
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

      stripe: {
        customerPortalURL: process.env.STRIPE_CUSTOMER_PORTAL,
      },
    },
  },

  imports: {
    dirs: [
      fileURLToPath(new URL('./app/api', import.meta.url)),
    ],
  },

  experimental: {
    typedPages: true,
    asyncContext: true,
    // appManifest: true,
  },

  alias: {
    '@base/server': fileURLToPath(new URL('./server', import.meta.url)),
    '@base/modules': fileURLToPath(new URL('./modules', import.meta.url)),
    '@base': fileURLToPath(new URL('./app', import.meta.url)),
  },

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
    optimizeDeps: {
      include: [
        'vnpay > moment',
        'vnpay > moment-timezone',
      ],
    },
  },

  build: {
    analyze: {
      analyzerMode: 'static',
    },
  },

  nitro: {
    devProxy: {
      host: 'localhost',
    },

    replace: {
      'import-in-the-middle': fileURLToPath(new URL('./node_modules/import-in-the-middle', import.meta.url)),
    },

    prerender: {
      crawlLinks: false,
    },

    alias: {
      '@base/server': fileURLToPath(new URL('./server', import.meta.url)),
    },
    typescript: {
      tsConfig: {
        compilerOptions: {
          paths: {
            '@base/server': ['../server'],
            '@base/server/*': ['../server/*'],
          },
        },
      },
    },
  },

  routeRules: {
    '/app/**': { swr: false, prerender: false, csurf: { enabled: true } },
    '/auth/**': { swr: false, prerender: false },
    '/docs': { redirect: '/docs/getting-started' },
    '/docs/**': { prerender: true },
    '/blog/**': { swr: true },
    '/api/payments/payos/webhook': { csurf: false },
    '/api/payments/vnpay/callback': { csurf: false },
    '/api/payments/vnpay/IPN': { csurf: false },
  },

  colorMode: {
    disableTransition: true,
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
    langDir: './',
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

  vuefire: {
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
      databaseURL: process.env.FIREBASE_DB_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },

  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    tags: [
      {
        id: process.env.FIREBASE_MEASUREMENT_ID || '',
      },
    ],
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

  security: {
    enabled: false,
    csrf: {
      cookieKey: 'csrfToken',
    },
    headers: {
      contentSecurityPolicy: {
        'img-src': false,
      },
    },
    hidePoweredBy: true,
    rateLimiter: {
      driver: {
        name: 'redis',
        options: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD,
          maxRetriesPerRequest: 0,
        },
      },
    },
  },

  compatibilityDate: '2024-07-12',
})

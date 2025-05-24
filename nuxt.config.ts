import fs from 'node:fs'

import { fileURLToPath } from 'node:url'
import { UserScope } from '@logto/node'

import { version as appVersion } from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  $development: {
    vite: {
      server: {
        allowedHosts: [
          '.ngrok.app',
        ],
      },
    },

    nodemailer: {
      secure: false,
      from: process.env.SMTP_FROM,
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT),
    },

    nitro: {
      tasks: {
        'email:test': {
          description: 'Test email sending',
        },
      },
    },
  },

  $production: {
    nodemailer: {
      secure: true,
      from: process.env.SMTP_FROM!,
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
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

  hooks: {
    'build:before': function () {
      try {
        fs.writeFileSync('./public/firebase-config.json', JSON.stringify({
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
          databaseURL: process.env.FIREBASE_DB_URL,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID,
          measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        }))
        console.log('Firebase config file written successfully')
      }
      catch (err) {
        console.error('Error writing to file:', err)
      }
    },
  },

  build: {
    analyze: {
      analyzerMode: 'static',
    },
  },

  nitro: {
    experimental: {
      tasks: true,
    },

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

    imports: {
      dirs: [
        fileURLToPath(new URL('./server/composables', import.meta.url)),
      ],
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
    '/callback': { cache: false, prerender: false, security: { enabled: false } },
    '/docs': { redirect: '/docs/getting-started' },
    '/docs/**': { prerender: true },
    '/blog/**': { swr: true },
    '/api/content/**': { csurf: false },
    '/api/logto/webhook': { csurf: false },
    '/api/payments/sepay/webhook': { csurf: false },
    '/api/payments/payos/webhook': { csurf: false },
    '/api/payments/vnpay/callback': { csurf: false },
    '/api/payments/vnpay/IPN': { csurf: false },
    '/_nitro/tasks/**': { csurf: false },
  },

  colorMode: {
    preference: 'system',
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

  eslint: {
    config: {
      standalone: false,
    },
  },

  security: {
    csrf: {
      cookieKey: 'csrfToken',
    },
    sri: false,
    corsHandler: false,
    headers: {
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: {
        'child-src': false,
        'connect-src': false,
        'default-src': false,
        'font-src': false,
        'frame-src': false,
        'img-src': false,
        'manifest-src': false,
        'media-src': false,
        'object-src': false,
        'prefetch-src': false,
        'script-src': false,
        'script-src-elem': false,
        'script-src-attr': false,
        'style-src': false,
        'style-src-elem': false,
        'style-src-attr': false,
        'worker-src': false,
        'base-uri': false,
        'sandbox': false,
        'form-action': false,
        'frame-ancestors': false,
        'report-uri': false,
        'report-to': false,
        'require-trusted-types-for': false,
        'trusted-types': false,
        'upgrade-insecure-requests': false,
      },
    },
    hidePoweredBy: true,
    rateLimiter: process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      ? {
          driver: {
            name: 'upstash',
          },
        }
      : process.env.REDIS_HOST && process.env.REDIS_PASSWORD
        ? {
            driver: {
              name: 'redis',
              options: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
                password: process.env.REDIS_PASSWORD,
              },
            },
          }
        : false,
  },

  compatibilityDate: '2024-07-12',
})
